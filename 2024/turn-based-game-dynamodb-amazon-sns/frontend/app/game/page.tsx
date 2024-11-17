'use client'

import { Box, Breadcrumbs, Button, CircularProgress, Grid2, Link, TextField, Typography } from "@mui/material";
import RouterLink from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation'
import styles from "./page.module.css";
import { createNewGame, fetchGame, performMove } from "../service";
import { CreateNewGameRequest, Game, PerformMoveRequest } from "../data";
import { store } from "../store";


const emptyGame: Game = {
  gameId: '',
  user1: '',
  user2: '',
  heap1: 0,
  heap2: 0,
  heap3: 0,
  lastMoveBy: '',
  lastModifiedAt: 0,
  expireAt: 0,
};

export default function Page() {
  return (
    <Suspense>
      <GamePage />
    </Suspense>
  )
}

function GamePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [heapName, setHeapName] = useState('');
  const [game, setGame] = useState<Game>(emptyGame);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [gameId, setGameId] = useState(params.get('gameId') || '');
  const isNewGame = !gameId;
  const currentUser = store.getState().currentUser;
  const isHeapDisabled = {
    heap1: heapName !== 'heap1' && heapName !== '' || isLoading || game.lastMoveBy === currentUser,
    heap2: heapName !== 'heap2' && heapName !== '' || isLoading || game.lastMoveBy === currentUser,
    heap3: heapName !== 'heap3' && heapName !== '' || isLoading || game.lastMoveBy === currentUser,
  };

  const submitGame = async ({ opponent, heapValue }: { opponent: string, heapValue: string }) => {
    if (isNewGame) {
      const data: CreateNewGameRequest = {
        opponent,
      };
      const { message, game } = await createNewGame(data);
      if (message) {
        return message;
      }

      setGame(game);
      setGameId(game.gameId);
    } else {
      const data: PerformMoveRequest = {
        // @ts-expect-error TODO: Fix type
        changedHeap: heapName,
        // @ts-expect-error TODO: Fix type
        changedHeapValue: parseInt(heapValue),
      };
      const { message, game } = await performMove(gameId, data);
      if (message) {
        return message;
      }

      setGame(game);
    }
    return '';
  };

  const handleHeapChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setHeapName(name);
    setGame({
      ...game,
      [name]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsLoading(true);
      setInfo('');
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      const opponent = data['opponent'].toString();
      const heapValue = data[heapName].toString();
      const message = await submitGame({ opponent, heapValue });
      if (message) {
        setInfo(message);
      }
    } catch (error) {
      console.error('Failed to ' + (isNewGame ? 'create game' : 'perform move'), error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!store.getState().idToken) {
      router.push('/');
      return;
    }
    if (isNewGame) {
      return;
    }

    const fetchGameAsync = async () => {
      try {
        setIsLoading(true);
        setInfo('');
        const { message, game } = await fetchGame(gameId);
        if (message) {
          console.error(message);
          setInfo(message);
          return;
        }
  
        setGame(game);
      } catch (error: unknown) {
        console.error('Failed to fetch game', error);
        if (error instanceof Error) {
          setInfo(error.message);
        } else {
          setInfo('Unexpected error during authentication');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameAsync();
  }, [router, isNewGame, gameId]);

  return (
    <>
      <Grid2
        container
        direction="column"
        spacing={2}
        sx={{
          justifyContent: "start",
          alignItems: "center",
          minHeight: "100vh",
          paddingY: 4,
        }}
      >
        <form onSubmit={handleSubmit} style={{ width: 300 }}>
          <Grid2
            container
            direction="column"
            spacing={2}
          >
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginX: "auto" }}>
              <Link underline="hover" color="inherit" href="/home" component={RouterLink}>
                Home
              </Link>
              <Typography sx={{ color: 'text.primary' }}>Game</Typography>
            </Breadcrumbs>

            {isNewGame &&
              <Typography variant="h4" component="h2" sx={{ marginX: "auto" }}>
                New Game
              </Typography>
            }
            {!isNewGame &&
              <Typography variant="h6" component="h2"
                className={styles.limited}
                sx={{ width: 300 }}
              >
                Game: {gameId}
                <br />
                Opponent: {game.user1 === currentUser ? game.user2 : game.user1}
                <br />
                Turn: {game.lastMoveBy === currentUser ? 'opponent' : 'you'}
              </Typography>
            }

            {isNewGame &&
              <TextField
                name="opponent"
                label="Opponent"
                placeholder="Username"
                type="text"
                variant="outlined"
                required
              />
            }
            {!isNewGame &&
              <TextField
                name="heap1"
                label="Heap 1"
                type="number"
                value={game.heap1}
                disabled={isHeapDisabled.heap1}
                onChange={handleHeapChange}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 4,
                  }
                }}
                variant="outlined"
                required
              />
            }
            {!isNewGame &&
              <TextField
                name="heap2"
                label="Heap 2"
                type="number"
                value={game.heap2}
                disabled={isHeapDisabled.heap2}
                onChange={handleHeapChange}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 4,
                  }
                }}
                variant="outlined"
                required
              />
            }
            {!isNewGame &&
              <TextField
                name="heap3"
                label="Heap 3"
                type="number"
                value={game.heap3}
                disabled={isHeapDisabled.heap3}
                onChange={handleHeapChange}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 4,
                  }
                }}
                variant="outlined"
                required
              />
            }

            {info &&
              <Typography variant="body1" color="error">
                {info}
              </Typography>
            }

            <Box sx={{ position: 'relative' }}>
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading || game.lastMoveBy === currentUser}
                sx={{ width: 300 }}
              >
                Submit {isNewGame ? 'game' : 'move'}
              </Button>
              {isLoading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Grid2 >
        </form>
      </Grid2 >
    </>
  );
}