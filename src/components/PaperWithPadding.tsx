import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

const PaperWithPadding = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  ...theme.typography.body2,
}));

export default PaperWithPadding;
