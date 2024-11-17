'use client'

import { Box, Button, CircularProgress, Grid2, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RouterLink from "next/link";
import styles from "./page.module.css";
import { store } from "../store";
import { useRouter } from "next/navigation";
import { fetchGames } from "../service";
import { Game } from "../data";


export default function Page() {
  const router = useRouter();
  const [runningGames, setRunningGames] = useState<Game[]>([]);
  const [finishedGames, setFinishedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = store.getState().currentUser;

  const fetchGamesAsync = async () => {
    try {
      setIsLoading(true);
      const { message, games } = await fetchGames();

      if (message) {
        console.error('Failed to fetch games', message);
        return;
      }

      const runningGames: Game[] = [];
      const finishedGames: Game[] = [];
      games.map(game => {
        if (game.heap1 === 0 && game.heap2 === 0 && game.heap3 === 0) {
          finishedGames.push(game);
        } else {
          runningGames.push(game);
        }
      });
      setRunningGames(runningGames);
      setFinishedGames(finishedGames);
    } catch (error) {
      console.error('Failed to fetch games', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!store.getState().idToken) {
      router.push('/');
      return;
    }
    fetchGamesAsync();
  }, [router]);

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
        <div style={{ width: 300 }}>
          <Button
            variant="outlined"
            onClick={fetchGamesAsync}
            sx={{ marginBottom: 3, width: 300 }}
          >
            Refresh
          </Button>

          <Typography variant="h4" component="h2" sx={{ textAlign: "center" }}>
            Running games
          </Typography>

          <Box sx={{ position: 'relative' }}>
            <List>
              {runningGames.map(game => (
                <ListItem
                  key={game.gameId}
                  disablePadding
                >
                  <ListItemButton href={'/game?gameId=' + game.gameId} component={RouterLink}>
                    <ListItemText
                      className={styles.limited}
                      primary={'Game: ' + game.gameId}
                      secondary={
                        <>
                          Opponent: {game.user1 === currentUser ? game.user2 : game.user1}
                          <br />
                          Turn: {game.lastMoveBy === currentUser ? 'opponent' : 'you'}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {!runningGames.length &&
              <Typography sx={{ minHeight: 40, textAlign: "center" }}>
                No running games yet
              </Typography>
            }
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

          <Button
            variant="contained"
            href="/game"
            component={RouterLink}
            sx={{ width: 300 }}
          >
            New game
          </Button>

          <Typography variant="h4" component="h2" sx={{ paddingTop: 3, textAlign: "center" }}>
            Finished games
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <List>
              {finishedGames.map(game => (
                <ListItem
                  key={game.gameId}
                  disablePadding
                >
                  <ListItemButton>
                    <ListItemText
                      className={styles.limited}
                      primary={'Game: ' + game.gameId}
                      secondary={
                        <>
                          Opponent: {game.user1 === currentUser ? game.user2 : game.user1}
                          <br />
                          Winner: {game.lastMoveBy === currentUser ? 'opponent' : 'you 🏆🎉'}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {!finishedGames.length &&
              <Typography sx={{ minHeight: 40, textAlign: "center" }}>
                No finished games yet
              </Typography>
            }
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

          <Button
            variant="outlined"
            href="/tutorial"
            component={RouterLink}
            sx={{ width: 300 }}
          >
            Tutorial
          </Button>
        </div>
      </Grid2>
    </>
  );
}