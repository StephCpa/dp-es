# LaTeX configuration to match Overleaf compilation
# This helps reduce differences between local and Overleaf builds

$pdf_mode = 1;  # Use pdflatex
$bibtex_use = 2;  # Use bibtex
$pdflatex = 'pdflatex -interaction=nonstopmode -synctex=1 %O %S';

# Clean up auxiliary files
$clean_ext = 'bbl nav snm synctex.gz';

# Extra file types to clean
@generated_exts = (@generated_exts, 'synctex.gz');
