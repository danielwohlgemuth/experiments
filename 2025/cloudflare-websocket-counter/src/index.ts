import { DurableObject } from "cloudflare:workers";

interface UpdateMessage {
	text: string;
}

interface WebSocketMessage {
	type: 'update';
	text: string;
	counter: number;
}

export class CounterObject extends DurableObject<Env> {
	private websockets: Set<WebSocket>;
	private currentText: string;
	private counter: number;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.websockets = new Set();
		this.currentText = "";
		this.counter = 0;

		this.ctx.blockConcurrencyWhile(async () => {
			this.currentText = (await ctx.storage.get("currentText")) as string;
			this.counter = (await ctx.storage.get("counter")) as number;
		});
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		
		// Handle WebSocket upgrade
		if (request.headers.get("Upgrade") === "websocket") {
		  const pair = new WebSocketPair();
		  const [client, server] = Object.values(pair);
		  
		  // Accept the WebSocket connection
		  server.accept();
		  this.websockets.add(server);
		  
		  // Send current state to new connection
		  const message: WebSocketMessage = {
			type: "update",
			text: this.currentText,
			counter: this.counter
		  };
		  server.send(JSON.stringify(message));
		  
		  // Handle connection close
		  server.addEventListener("close", () => {
			this.websockets.delete(server);
		  });
		  
		  // Handle errors
		  server.addEventListener("error", () => {
			this.websockets.delete(server);
		  });
		  
		  return new Response(null, {
			status: 101,
			webSocket: client
		  });
		}
		
		// Handle text updates
		if (url.pathname === "/update" && request.method === "POST") {
		  const updateData: UpdateMessage = await request.json();
		  const { text } = updateData;
		  
		  // Reset counter if text changed, otherwise increment
		  if (text !== this.currentText) {
			this.currentText = text;
			this.counter = 1;
		  } else {
			this.counter++;
		  }
		  
		  // Persist state
		  await this.ctx.storage.put({
			"currentText": this.currentText,
			"counter": this.counter
		  });
		  
		  // Broadcast to all connected WebSocket clients
		  const message: WebSocketMessage = {
			type: "update",
			text: this.currentText,
			counter: this.counter
		  };
		  
		  const messageStr = JSON.stringify(message);
		  
		  // Create array from Set to safely iterate while potentially modifying
		  const websocketsArray = Array.from(this.websockets);
		  
		  for (const ws of websocketsArray) {
			try {
			  ws.send(messageStr);
			} catch (err) {
			  // Remove broken connections
			  this.websockets.delete(ws);
			}
		  }
		  
		  return new Response("Updated", { status: 200 });
		}
		
		// Handle state requests
		// if (url.pathname === "/state") {
		//   const stateResponse: Omit<WebSocketMessage, 'type'> = {
		// 	text: this.currentText,
		// 	counter: this.counter
		//   };
		  
		//   return new Response(JSON.stringify(stateResponse), {
		// 	headers: { "Content-Type": "application/json" }
		//   });
		// }
		
		return new Response("Not found", { status: 404 });
	}
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      const url = new URL(request.url);
      
      // Get the Durable Object ID (using a fixed ID for single global counter)
      const id = env.COUNTER_OBJECT.idFromName("global-counter");
      const obj = env.COUNTER_OBJECT.get(id);
      
      // Handle WebSocket upgrade
      if (request.headers.get("Upgrade") === "websocket") {
        return obj.fetch(request);
      }
      
      // Handle text parameter updates
      if (url.searchParams.has("text")) {
        const text = url.searchParams.get("text");
        if (!text) {
          return new Response("Text parameter is required", { status: 400 });
        }
        
        await obj.fetch(new Request(`${url.origin}/update`, {
          method: "POST",
          body: JSON.stringify({ text } as UpdateMessage),
          headers: { "Content-Type": "application/json" }
        }));
        
        return new Response("Counter updated!", { 
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      
      // Serve the HTML page
	  const html = await env.WebsocketCounter.get("index.html");
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }
} satisfies ExportedHandler<Env>;

