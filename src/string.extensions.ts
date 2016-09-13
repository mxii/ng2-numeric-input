
interface String {
  padLeft: (fill: string, size: number) => string;
  replaceAll: (find: string, value: string, ignoreCase?: boolean) => string;
}

String.prototype.padLeft = function (fill: string, size: number): string {
  let s = this + '';
  while (s.length < size) { s = fill + s; }
  return s;
};

String.prototype.replaceAll = function (find: string, value: string, ignoreCase: boolean = false): string {
  return this.replace(new RegExp(find.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignoreCase ? "gi" : "g")), (typeof (value) == "string") ? value.replace(/\$/g, "$$$$") : value);
}

// EOF
