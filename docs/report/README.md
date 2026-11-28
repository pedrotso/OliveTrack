# OliveTrack report

Open [report.pdf](report.pdf) for the compiled report. Edit `main.tex` or the relevant files in `sections/` and `use-cases/` to update it. Configuration and figures are in `config/` and `figures/`.

From the `report` directory, run the following with a LaTeX distribution that includes `latexmk` and `pdfLaTeX`:

```sh
latexmk -pdf -outdir=build main.tex
```

The build produces `build/main.pdf`. Copy that file to `report.pdf` when publishing an update to the report. Build files in `build/` are ignored by Git.

You can also create the `build` directory and run `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex` until the references stabilise.
