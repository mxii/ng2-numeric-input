# ng2-numeric-input

With this component you can type in normal numbers but display them with thousand separators or add easily a currency..

Use it like this:

```HTML

<ng2-numeric-input
   decimal-character=","
   thousand-character="."
   decimal-length="3"
   currency="€"
   [(ngModel)]="myNumber"
   >
</ng2-numeric-input>

```

You can also change the default characters via global variables:

```javascript

NumericInputComponent.DECIMAL_CHARACTER = '.';
NumericInputComponent.THOUSAND_CHARACTER = ',';

```
