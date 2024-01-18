import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body2Bold: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    body2Bold?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body2Bold: true;
  }
}
