import Head from "next/head";
import Grid from "@mui/material/Unstable_Grid2";
import { Container, IconButton, Paper, styled } from "@mui/material";
import FileSelector, { LabeledFile } from "@/components/FileSelector";
import { useState } from "react";
import AudioLabeler from "@/components/AudioLabeler";
import GitHubIcon from "@mui/icons-material/GitHub";

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
  alignContent: "center",
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
}));

export default function Home() {
  const [files, setFiles] = useState<LabeledFile[]>([]);
  const [selected, setSelected] = useState<LabeledFile | null>(null);
  const [audio, setAudio] = useState<string>("");

  const onSelectedAudio = async (file: LabeledFile) => {
    const base64 = await getBase64(file.file);
    setAudio(base64 as string);

    setSelected(file);
  };

  const onPrev = async (text: string, pinYin: string) => {
    await onSave(text, pinYin);

    const index = files.findIndex((f) => f.name === selected?.name);

    if (index > 0) {
      onSelectedAudio(files[index - 1]);
    }
  };

  const onNext = async (text: string, pinYin: string) => {
    await onSave(text, pinYin);

    const index = files.findIndex((f) => f.name === selected?.name);

    if (index < files.length - 1) {
      onSelectedAudio(files[index + 1]);
    }
  };

  const onSave = async (text: string, pinYin: string) => {
    if (!selected) {
      return;
    }

    selected.text = text;
    selected.pinYin = pinYin;
    selected.labeled = true;

    const fileHandle: any = await selected.directoryHandle.getFileHandle(
      selected.labelFileName,
      { create: true }
    );
    const writable = await fileHandle.createWritable();
    await writable.write(`${text}\n${pinYin}`);
    await writable.close();

    setFiles([...files]);
  };

  const onDelete = async () => {
    if (!selected) {
      return;
    }

    try {
      await selected.directoryHandle.removeEntry(selected.file.name);

      try {
        await selected.directoryHandle.removeEntry(selected.labelFileName);
      } catch {}

      // remove from list
      const index = files.findIndex((f) => f.name === selected.name);
      files.splice(index, 1);
      setFiles([...files]);

      // select next
      if (index < files.length) {
        onSelectedAudio(files[index]);
      }
    } catch (e) {
      console.error("删除失败", e);
      alert("删除失败");
      return;
    }
  };

  const openRepo = () => {
    window.open("https://github.com/fishaudio/text-labeler", "_blank");
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
              <Header>
                Fish Audio Labeler
                <IconButton sx={{ color: "#000" }} onClick={openRepo}>
                  <GitHubIcon />
                </IconButton>
              </Header>
            </Grid>
            <Grid xs={12} md={4}>
              <FileSelector
                files={files}
                setFiles={setFiles}
                selected={selected}
                setSelected={onSelectedAudio}
              />
            </Grid>
            <Grid xs={12} md={8}>
              <AudioLabeler
                audio={audio}
                text={selected?.text || ""}
                pinYin={selected?.pinYin || ""}
                onPrev={onPrev}
                onNext={onNext}
                onSave={onSave}
                onDelete={onDelete}
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}
