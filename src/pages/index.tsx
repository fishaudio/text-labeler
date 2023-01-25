import Head from "next/head";
import Grid from "@mui/material/Unstable_Grid2";
import { Container, Paper, styled } from "@mui/material";
import FileSelector, { LabeledFile } from "@/components/FileSelector";
import { useState } from "react";
import AudioLabeler from "@/components/AudioLabeler";

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const Header = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  ...theme.typography.h5,
  textAlign: "center",
}));

export default function Home() {
  const [files, setFiles] = useState<LabeledFile[]>([]);
  const [selected, setSelected] = useState<LabeledFile | null>(null);
  const [audio, setAudio] = useState<string>("");
  const [pinYin, setPinYin] = useState<string>("");

  const onSelectedAudio = async (file: LabeledFile) => {
    const base64 = await getBase64(file.file);
    setAudio(base64 as string);
    setPinYin(file.pinYin || "");

    setSelected(file);
  };

  const onPrev = async () => {
    await onSave();

    const index = files.findIndex((f) => f.name === selected?.name);

    if (index > 0) {
      onSelectedAudio(files[index - 1]);
    }
  };

  const onNext = async () => {
    await onSave();

    const index = files.findIndex((f) => f.name === selected?.name);

    if (index < files.length - 1) {
      onSelectedAudio(files[index + 1]);
    }
  };

  const onSave = async () => {
    if (!selected) {
      return;
    }

    selected.pinYin = pinYin;
    selected.labeled = true;

    const fileHandle: any = await selected.directoryHandle.getFileHandle(
      selected.labelFileName,
      { create: true }
    );
    const writable = await fileHandle.createWritable();
    await writable.write(pinYin);
    await writable.close();

    setFiles([...files]);
  };

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
              <Header>Fish Audio Labeler</Header>
            </Grid>
            <Grid xs={4}>
              <FileSelector
                files={files}
                setFiles={setFiles}
                selected={selected}
                setSelected={onSelectedAudio}
              />
            </Grid>
            <Grid xs={8}>
              <AudioLabeler
                audio={audio}
                pinYin={pinYin}
                onPrev={onPrev}
                onNext={onNext}
                onSave={onSave}
                setPinYin={setPinYin}
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}
