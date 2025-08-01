import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function useWidthRule(mode, width) {
   const theme = useTheme();
   return useMediaQuery(theme.breakpoints[mode](width));
}
