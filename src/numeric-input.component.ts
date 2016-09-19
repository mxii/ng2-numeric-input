import { Component, OnInit, forwardRef, Input, ElementRef, ViewChild, Renderer } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import './string.extensions';

@Component({
   selector: 'ng2-numeric-input',
   //templateUrl: 'numeric-input.component.html',
   template: `
<div class="numeric-input">
<div class="inputs">
   <input #formattedView type="text" (click)="_startEditing()" (focus)="_startEditing()" readonly
      value="{{_formattedNumber}}" [style.background-color]="_errMsg == '' ? '' : 'red'" class="form-control" />
   <input #numberInput (change)="_valueChanged($event.target.value)" type="text" [pattern]="_pattern"
      (blur)="_stopEditing()" class="form-control" [hidden]="!_editing" />
</div>
<div class="messages">
   {{_errMsg}}
</div>
</div>
   `,
   //styleUrls: ['numeric-input.component.scss'],
   styles: [
      `
.numeric-input {
  position: relative !important;
}

.numeric-input input:last-of-type {
   position: absolute !important;
   left: 0px;
   top: 0px;
}

/* otherwise its not working with class="form-control" cause MOST browser do not append '!important' if attribute.hide is true !! */
[hidden] {
  display: none !important;
}
      `
   ],
   providers: [
      { /* idk why or what this will do exactly.. but it works! ;) */
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => NumericInputComponent),
         multi: true
      }
   ],
})
export class NumericInputComponent implements OnInit, ControlValueAccessor {

   public static DECIMAL_CHARACTER = ',';
   public static THOUSAND_CHARACTER = '.';

   private _formattedNumber: string = '';
   private _errMsg: string;
   private _editing = false;
   private _pattern = '';

   @ViewChild('numberInput') private _numberInputField: ElementRef;
   @Input('value') private _no: number;

   @Input('decimal-character') decimalCharacter: string = NumericInputComponent.DECIMAL_CHARACTER;
   @Input('thousand-character') thousandCharacter: string = NumericInputComponent.THOUSAND_CHARACTER;
   @Input('decimal-length') decimalLength: number = 2;
   @Input() currency: string = '';

   public constructor(private _renderer: Renderer) {
   }

   public ngOnInit() {
      if (this.decimalCharacter === this.thousandCharacter) {
         throw "decimal-character and thousand-character are the same! Thats not allowed!";
      }

      this._no = this._parseInput(this._no);

      this._updateNumber();
      this._updateNumericString();

      this._pattern = '[ ]*[+-]{0,1}\d*' + this.decimalCharacter + '{0,1}\d*[ ]*';
   }

   private _normalizeNumberToString(val: any, decimalChar: string, thousandChar: string): string {
      if (isNaN(val)) return '';

      let tmp = val.toString();

      tmp = tmp.replaceAll(',', 't');
      tmp = tmp.replaceAll('.', 'd');

      tmp = tmp.replaceAll('d', decimalChar);
      tmp = tmp.replaceAll('t', thousandChar);

      return tmp;
   }

   private _normalizeNumber(val: any, decimalChar: string, thousandChar: string): number {
      if (typeof (val) === 'number') return val;
      if (!val) return undefined;

      let tmp = val.toString().trim();

      tmp = tmp.replaceAll(thousandChar, 't');
      tmp = tmp.replaceAll(decimalChar, 'd');

      tmp = tmp.replaceAll('t', '');
      tmp = tmp.replaceAll('d', '.');

      return isNaN(tmp) ? undefined : parseFloat(tmp);
   }

   private _updateNumericString() {
      if (this._errMsg != '' || isNaN(this._no)) {
         this._formattedNumber = '#';
         return;
      }

      let tmp = this._normalizeNumberToString(this._no, this.decimalCharacter, this.thousandCharacter);

      if (tmp.indexOf(this.decimalCharacter) >= 0) {
         var fullnumber = tmp.split(this.decimalCharacter)[0];
         var decimal = tmp.split(this.decimalCharacter)[1];

         if (decimal.length > this.decimalLength) {
            decimal = decimal.substring(0, this.decimalLength);
         }

         tmp = (fullnumber.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandCharacter) + this.decimalCharacter + decimal);
      }
      else {
         tmp = tmp.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandCharacter);
      }

      // trim ending zeros
      while (tmp.length && tmp.indexOf(this.decimalCharacter) && (tmp[tmp.length - 1] === '0' || tmp[tmp.length - 1] === this.decimalCharacter)) {
         tmp = tmp.substr(0, tmp.length - 1);
      }

      this._formattedNumber = tmp + this.currency;
   }

   private _updateNumber() {
      if (isNaN(this._no)) {
         //this.numberInputField.nativeElement.value = ''; do not override false value ?!
         return;
      }

      let tmp = this._normalizeNumberToString(this._no, this.decimalCharacter, '');
      this._numberInputField.nativeElement.value = tmp;
   }

   private _parseInput(val: any): number {
      return this._normalizeNumber(val, this.decimalCharacter, this.thousandCharacter);
   }

   private _checkValidState(val: any) {
      this._errMsg = '';

      if (typeof (val) === 'number') {
         val = this._normalizeNumberToString(val, this.decimalCharacter, '');
      }

      let regex = new RegExp(this._numberInputField.nativeElement.pattern);
      let matches = regex.exec(val);

      if (!matches || !matches.length || matches[0] != val) {
         this._errMsg = 'PATTERN DOES NOT MATCH!';
      }
   }

   private _startEditing() {
      this._editing = true;

      setTimeout(() => {
         this._updateNumber();
         this._renderer.invokeElementMethod(this._numberInputField.nativeElement, 'focus', []);
      }, 1);
   }

   private _stopEditing() {
      this._checkValidState(this._numberInputField.nativeElement.value);
      this._updateNumericString();

      this._editing = false;
   }

   private _valueChanged(val: any) {
      this._no = this._parseInput(val);
      this._checkValidState(val);

      if (this._onTouched) this._onTouched();
      if (this._onChange) this._onChange(this._no);

      this._updateNumericString();
   }

   // ControlValueAccessor implementation
   // ====================================

   private _onChange = (_: any) => { };
   private _onTouched = () => { };

   public writeValue(val: any) {
      this._no = this._parseInput(val);
      this._checkValidState(val);

      this._updateNumber();
      this._updateNumericString();
   }

   public registerOnChange(fn: (_: any) => void): void { this._onChange = fn; }
   public registerOnTouched(fn: () => void): void { this._onTouched = fn; }

}
