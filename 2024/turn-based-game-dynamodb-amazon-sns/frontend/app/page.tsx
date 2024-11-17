'use client'

import Image from "next/image";
import { Box, Button, CircularProgress, Grid2, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useRouter } from 'next/navigation'
import { useState } from "react";
import { createUser, login } from "./service";
import { CreateUserRequest, LoginRequest } from "./data";
import { store, setIdToken, setCurrentUser } from "./store";


export default function Page() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState('sign-in');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSignUp = tabValue === 'sign-up';

  const authenticate = async ({ username, password, email, phoneNumber }: CreateUserRequest): Promise<string> => {
    if (isSignUp) {
      const data: CreateUserRequest = {
        username,
        password,
        email,
        phoneNumber,
      };
      const { message } = await createUser(data);

      if (message) {
        return message;
      }
    }

    const data: LoginRequest = {
      username,
      password,
    };
    const { message, idToken } = await login(data);

    if (message) {
      return message;
    }

    store.dispatch(setIdToken(idToken));
    store.dispatch(setCurrentUser(username));
    return '';
  };

  const handleTabChange = (event: React.SyntheticEvent, tabValue: string) => {
    setInfo('');
    setTabValue(tabValue);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsLoading(true);
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      setInfo('');
      // @ts-expect-error TODO: Fix type
      const error = await authenticate(data);
      if (error) {
        setInfo(error);
        return;
      }

      router.push('/home');
    } catch (error: unknown) {
      console.error('Failed to authenticate', error);
      if (error instanceof Error) {
        setInfo(error.message);
      } else {
        setInfo('Unexpected error during authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Grid2
        container
        direction="column"
        spacing={2}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          paddingY: 4,
        }}
      >
        <Image
          src="/stack.svg"
          alt="Nim logo"
          width={50}
          height={50}
          priority
        />

        <Typography variant="h4" component="h2">
          Nim Game
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Sing in / Sign up tabs"
        >
          <Tab label="Sign in" value="sign-in" />
          <Tab label="Sign up" value="sign-up" />
        </Tabs>

        <form onSubmit={handleSubmit} style={{ width: 300 }}>
          <Grid2
            container
            direction="column"
            spacing={2}
          >
            <TextField
              name="username"
              label="Username"
              type="text"
              slotProps={{
                htmlInput: {
                  minLength: 4,
                  maxLength: 20,
                },
              }}
              variant="outlined"
              required
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              required
            />

            {isSignUp &&
              <TextField
                name="email"
                label="Email address"
                type="email"
                variant="outlined"
                required
              />
            }
            {isSignUp &&
              <TextField
                name="phoneNumber"
                label="Phone number"
                type="tel"
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
                disabled={isLoading}
                sx={{ width: 300 }}
              >
                Sign {isSignUp ? 'up' : 'in'}
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
          </Grid2>
        </form>
      </Grid2>
    </>
  );
}
