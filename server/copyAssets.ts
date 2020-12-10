import * as shell from "shelljs";

shell.cp("-R", "src/views", "dist/");
shell.cp("-R", "src/views", "build/");
shell.mv("-f", "dist/server/src", "dist/")