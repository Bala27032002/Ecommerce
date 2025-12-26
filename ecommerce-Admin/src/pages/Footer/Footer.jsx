import{
        Typography,
        Box,Button
    } from "@mui/material"
export default function Footer({ page, totalPages, onPrev, onNext }){
    
    return(
        <>
        <Box  display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={2}>
           <Button disabled={page === 1} onClick={onPrev}>
        Prev
      </Button>
           <Typography variant="body2">
        Page {page} of {totalPages}
      </Typography>
            <Button
        disabled={page === totalPages}
        onClick={onNext}
      >
        Next
      </Button>

        </Box>
        </>
    )
}