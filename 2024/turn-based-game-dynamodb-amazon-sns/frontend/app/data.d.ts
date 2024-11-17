
type LoginRequest = {
    username: string;
    password: string;
};

type LoginResponse = Error & {
    idToken: string;
};

type CreateUserRequest = {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
};

type CreateUserResponse = Error & {
    username: string;
    email: string;
    phoneNumber: string;
};

type CreateNewGameRequest = {
    opponent: string;
};

type CreateNewGameResponse = Error & {
    game: Game;
};

type FetchGameResponse = Error & {
    game: Game;
};

type FetchGamesResponse = Error & {
    games: Game[];
};

type PerformMoveRequest = {
    changedHeap: 'heap1' | 'heap2' | 'heap3';
    changedHeapValue: 0 | 1 | 2 | 3 | 4;
};

type Game = {
    gameId: string;
    user1: string;
    user2: string;
    heap1: 0 | 1 | 2 | 3 | 4;
    heap2: 0 | 1 | 2 | 3 | 4;
    heap3: 0 | 1 | 2 | 3 | 4;
    lastMoveBy: string;
    lastModifiedAt: number;
    expireAt: number;
};

type Error = {
    message: string;
};

export {
    LoginRequest,
    LoginResponse,
    CreateUserRequest,
    CreateUserResponse,
    CreateNewGameRequest,
    PerformMoveRequest,
    Game,
    Error,
    CreateNewGameResponse,
    FetchGameResponse,
    FetchGamesResponse,
};
