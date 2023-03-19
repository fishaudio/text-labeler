import Head from "next/head";
import Grid from "@mui/material/Unstable_Grid2";
import { Container, IconButton, Paper, styled } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useEffect, useRef, useState } from "react";
import data from "./data.json";
import { drawMelAndPitches } from "@/components/MelSpec";

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  ...theme.typography.h5,
  textAlign: "center",
  alignContent: "center",
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
}));

export default function PitchEditor() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  const openRepo = () => {
    window.open("https://github.com/fishaudio/text-labeler", "_blank");
  };

  const mel: number[][] = (data as any).mel;
  const pitches: {
    [key: string]: number[];
  } = (data as any).pitches;

  useEffect(() => {
    if (!canvas.current) return;

    const start = performance.now();
    drawMelAndPitches(canvas.current, mel, pitches["final"]);
    console.log(`Drawn mel in ${performance.now() - start}ms`);
  }, [canvas, scale]);

  return (
    <>
      <Head>
        <title>Fish Audio Labeler</title>
        <meta name="description" content="Fish Audio Labeler" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Header>
                Fish Audio Labeler
                <IconButton sx={{ color: "#000" }} onClick={openRepo}>
                  <GitHubIcon />
                </IconButton>
              </Header>
            </Grid>
            <Grid xs={12} md={12}>
              <div>
                <button onClick={() => setScale((prevScale) => prevScale * 2)}>
                  Zoom In
                </button>
                <button onClick={() => setScale((prevScale) => prevScale / 2)}>
                  Zoom Out
                </button>
              </div>
            </Grid>
            <Grid
              xs={12}
              md={12}
              sx={{
                overflow: "auto",
                border: "1px solid #000",
              }}
            >
              <canvas ref={canvas} width={mel[0].length * scale} height={512} />
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}
