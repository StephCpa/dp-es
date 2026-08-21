#!/bin/bash
# Compile script for DP-ES ACL paper

echo "Compiling DP-ES paper..."
echo "========================"

# Check if pdflatex is available
if ! command -v pdflatex &> /dev/null; then
    echo "ERROR: pdflatex not found. Please install LaTeX:"
    echo "  macOS: brew install --cask mactex"
    echo "  Linux: sudo apt-get install texlive-full"
    exit 1
fi

# Navigate to paper directory
cd "$(dirname "$0")"

# First pass
echo "Pass 1: Running pdflatex..."
pdflatex -interaction=nonstopmode main.tex > compile.log 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR in first pdflatex pass. Check compile.log"
    tail -50 compile.log
    exit 1
fi

# Generate bibliography
echo "Generating bibliography..."
bibtex main >> compile.log 2>&1

# Second pass
echo "Pass 2: Running pdflatex..."
pdflatex -interaction=nonstopmode main.tex >> compile.log 2>&1

# Third pass (for references)
echo "Pass 3: Running pdflatex (final)..."
pdflatex -interaction=nonstopmode main.tex >> compile.log 2>&1

if [ $? -eq 0 ]; then
    echo "SUCCESS! PDF generated: main.pdf"
    echo "Page count:"
    pdfinfo main.pdf 2>/dev/null | grep Pages || echo "  (install poppler-utils for page count)"
    echo ""
    echo "Open with: open main.pdf"
else
    echo "ERROR in final compilation. Check compile.log"
    tail -50 compile.log
    exit 1
fi

# Clean up auxiliary files (optional)
# rm -f *.aux *.log *.bbl *.blg *.out
