'use client'

import { Breadcrumbs, Grid2, Link, SxProps, Typography } from "@mui/material";
import RouterLink from "next/link";
import React from "react";


const textStyle: SxProps = {
  textAlign: 'center',
  maxWidth: 400,
  paddingX: 3,
  paddingY: 1,
};

export default function Page() {
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
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/home" component={RouterLink}>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Tutorial</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h2">
          Tutorial
        </Typography>

        <div>
          <Typography sx={textStyle}>
            Nim is a game where two players take turns removing objects from a number of heaps.
          </Typography>
          <Typography sx={textStyle}>
            On each turn, a player removes one or more objects from a single heap.
          </Typography>
          <Typography sx={textStyle}>
            The player who takes the last object loses.
          </Typography>
        </div>
      </Grid2>
    </>
  );
}