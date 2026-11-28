# Relatório OliveTrack

`main.tex` é o ponto de entrada. As secções, casos de uso, configurações e figuras estão nas pastas correspondentes.

Com uma distribuição LaTeX instalada, executar dentro de `docs/latex`:

```sh
latexmk -pdf -outdir=build main.tex
```

O PDF é gerado em `build/main.pdf`. Também podes criar a pasta `build` e executar `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex` até as referências estabilizarem.
