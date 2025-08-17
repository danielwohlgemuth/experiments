# AWS Simple Architecture

In this project, a simple AWS architecture is created to explore the following concepts:
- [SSH Jump Host](#ssh-jump-host)
- [NAT Instance](#nat-instance)
- [Reverse Proxy](#reverse-proxy)

![AWS Simple Architecture](/2025/aws-simple-architecture/assets/aws-simple-architecture.drawio.png)

[AWS Simple Architecture diagram file](https://app.diagrams.net/?title=aws-simple-architecture#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2025%2Faws-simple-architecture%2Fassets%2Faws-simple-architecture.drawio)

### Motivation

The main motivation for this project was to explore alternatives to the NAT Gateway as it can make hobby projects unnecessarily expensive.

### Pricing (US East N. Virginia):

| Service | Price per hour | Price per month (730 hours) | Additional |
| - | - | - | - |
| NAT Gateway | $0.045 | $32.85 | $0.045 per GB processed |
| Public IPv4 Address | $0.005 | $3.65 | |
| EC2 t2.micro Instance | $0.0116 | $8.468 | $0.09 per GB transferred out |

- https://aws.amazon.com/vpc/pricing/
- https://aws.amazon.com/ec2/pricing/on-demand/

Summarizing the table, having a NAT Gateway would cost $32.85 per month, while having a self-managed NAT Instance would cost $12.118 (public IPv4 address + EC2 t2.micro instance), or almost a third of the cost of a NAT Gateway, assuming only light traffic. The drawback is that the NAT instance requires manual maintenance and is a single point of failure.

### AWS Pricing Calculator

- NAT Gateway [link 🔗](https://calculator.aws/#/estimate?id=36ab0344f39b23e5fd53c23a5a4841fe55ef7f2b) and [file 📄](/2025/aws-simple-architecture/assets/nat-gateway.json)
- NAT Instance [link 🔗](https://calculator.aws/#/estimate?id=e1e41489e6ba0b4b5de08c47a359c18ad8a7e048) and [file 📄](/2025/aws-simple-architecture/assets/nat-instance.json)

## Concepts

### Bastion Host

A [Bastion Host](https://en.wikipedia.org/wiki/Bastion_host) is a hardened computer positioned between untrusted networks (like the internet) and trusted internal networks. It serves as a secure access point to reach private servers that are not directly exposed to the internet. In this setup, you first connect to the bastion host from the internet, then use it as a secure jump point to access private servers within the trusted network.

### SSH Jump Host

A [Jump Host](https://en.wikipedia.org/wiki/Jump_server) is a server that acts as an intermediary for accessing other servers in a secure network. While similar to a bastion host, a jump host is typically simpler and focuses specifically on providing SSH access to private resources.

![SSH Jump Host](/2025/aws-simple-architecture/assets/aws-ssh-jump-host.drawio.png)

[SSH Jump Host diagram file](https://app.diagrams.net/?title=aws-ssh-jump-host#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2025%2Faws-simple-architecture%2Fassets%2Faws-ssh-jump-host.drawio)

### NAT Instance

A [NAT](https://en.wikipedia.org/wiki/Network_address_translation) Instance allows a server to reach another server in a different network without having the appropriate IP address to communicate. Usually this is used to allow a private server to access the internet without the need for a public IP. To clarify, the NAT instance does need a public IP to make it work and it can then serve multiple private servers, saving on additional public IPs.

![NAT Instance](/2025/aws-simple-architecture/assets/aws-nat-instance.drawio.png)

[NAT Instance diagram file](https://app.diagrams.net/?title=aws-nat-instance#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2025%2Faws-simple-architecture%2Fassets%2Faws-nat-instance.drawio)

### Reverse Proxy

A [Reverse Proxy](https://en.wikipedia.org/wiki/Reverse_proxy) can help passing requests from the internet to the appropriate private servers.

![Reverse Proxy](/2025/aws-simple-architecture/assets/aws-reverse-proxy.drawio.png)

[Reverse Proxy diagram file](https://app.diagrams.net/?title=aws-reverse-proxy#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2025%2Faws-simple-architecture%2Fassets%2Faws-reverse-proxy.drawio)

## Setup

### Prerequisite

Have the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html) installed.

Initialize the CDK toolkit stack in AWS.

```bash
cdk bootstrap
```

Create a key pair in EC2. You can use the [create-key-pair.sh](/2025/aws-simple-architecture/create-key-pair.sh) script to create one locally that also gets uploaded to AWS.

```bash
./create-key-pair.sh
```

### Network configuration for the AWS Simple Architecture

![AWS Simple Architecture Network](/2025/aws-simple-architecture/assets/aws-simple-architecture-network.drawio.png)

[AWS Simple Architecture Network diagram file](https://app.diagrams.net/?title=aws-simple-architecture-network#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2025%2Faws-simple-architecture%2Fassets%2Faws-simple-architecture-network.drawio)

### SSH Jump Host Setup

If you want to see how to set it up manually, see this [YouTube video](https://youtu.be/WWoKltMSqt8).

Deploy the stack to AWS.

```bash
cd ssh-jump-host
cdk deploy
cd ..
```

Take note of the IP address from the next command and replace it where is says `<PRIVATE_IP_HERE>`.

```bash
aws cloudformation describe-stacks --stack-name SshJumpHostStack --query "Stacks[0].Outputs[?OutputKey=='PrivateServerPrivateIP'].OutputValue" --output text
```

Store the public IP address from the jump host in a variable.

```bash
JUMP_HOST_IP=$(aws cloudformation describe-stacks --stack-name SshJumpHostStack --query "Stacks[0].Outputs[?OutputKey=='JumpHostPublicIP'].OutputValue" --output text)
```

Copy the SSH key into the jump host to be able to login to the private server later.

```bash
scp -i aws-simple-architecture-key-pair aws-simple-architecture-key-pair ec2-user@$JUMP_HOST_IP:.
```

Access the jump host through SSH.

```bash
ssh -i aws-simple-architecture-key-pair ec2-user@$JUMP_HOST_IP
```

Access the private host from the jump host through SSH.

```bash
ssh -i aws-simple-architecture-key-pair ec2-user@<PRIVATE_IP_HERE>
```

### NAT Instance Setup

Deploy the stack to AWS.

```bash
cd nat-instance
cdk deploy
cd ..
```

The NAT instance allows private instances to access the internet. To verify that the NAT instance is working correctly, you can use the [Cloudflare Websocket Counter](/2025/cloudflare-websocket-counter) project. The private instance in this setup will automatically make HTTP requests to the websocket counter, demonstrating that it can reach the internet through the NAT instance.

By default, the private instance will call the `https://websocket-counter.daniel-wohlgemuth.workers.dev/api/update?text=` URL every 3 seconds with the hostname of the instance appended to the URL.

The URL and frequency are defined as parameters. You can override these parameters during deployment:

```bash
cd nat-instance
cdk deploy --parameters WebsocketCounterUrl=https://your-custom-url.com/api/update?text= --parameters WebsocketCounterSleep=5
cd ..
```

### Reverse Proxy Setup

Deploy the stack to AWS.

```bash
cd reverse-proxy
cdk deploy
cd ..
```

To verify that the reverse proxy is working correctly, you can access the private server through the proxy's public IP address. The proxy will forward requests to the private instance, allowing external access without exposing the private instance directly to the internet.

Use the following command to get the proxy's public IP.

```bash
aws cloudformation describe-stacks --stack-name ReverseProxyStack --query "Stacks[0].Outputs[?OutputKey=='ReverseProxyPublicIP'].OutputValue" --output text
```

### Simple Architecture Setup

Deploy the stack to AWS.

```bash
cd simple-architecture
cdk deploy
cd ..
```

This stack combines all three previous approaches. One difference is that it uses the Apache HTTP Server as a reverse proxy instead of socat to allow routing requests to different private servers instead of just a single server.

## Resources
- https://docs.aws.amazon.com/vpc/latest/userguide/VPC_NAT_Instance.html
- https://docs.aws.amazon.com/vpc/latest/userguide/work-with-nat-instances.html
