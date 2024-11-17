import {
  CreateNewGameRequest,
  CreateNewGameResponse,
  CreateUserRequest,
  CreateUserResponse,
  FetchGameResponse,
  FetchGamesResponse,
  LoginRequest,
  LoginResponse,
  PerformMoveRequest,
} from "./data";
import { store } from "./store";


const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(APP_URL + 'login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json;
};

const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await fetch(APP_URL + 'users', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json;
};

const createNewGame = async (data: CreateNewGameRequest): Promise<CreateNewGameResponse> => {
  const response = await fetch(APP_URL + 'games', {
    method: 'POST',
    headers: {
      'Authorization': store.getState().idToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json;
};

const fetchGame = async (gameId: string): Promise<FetchGameResponse> => {
  const response = await fetch(APP_URL + 'games/' + gameId, {
    method: 'GET',
    headers: {
      'Authorization': store.getState().idToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const json = await response.json();
  return json;
};

const fetchGames = async (): Promise<FetchGamesResponse> => {
  const response = await fetch(APP_URL + 'games', {
    method: 'GET',
    headers: {
      'Authorization': store.getState().idToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const json = await response.json();
  return json;
};

const performMove = async (gameId: string, data: PerformMoveRequest) => {
  const response = await fetch(APP_URL + 'games/' + gameId, {
    method: 'POST',
    headers: {
      'Authorization': store.getState().idToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json;
};

export {
  login,
  createUser,
  createNewGame,
  fetchGame,
  fetchGames,
  performMove,
};