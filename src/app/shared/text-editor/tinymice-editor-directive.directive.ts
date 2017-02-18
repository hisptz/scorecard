import {AfterViewInit, ChangeDetectorRef, Directive, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

//This is needed to update the tinymce editor when the model gets changed
const CUSTOM_VALUE_ACCESSOR = {
  provide:NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TinymceEditorDirective),
  multi: true
}

@Directive({
  inputs: ['tinyEditor'],
  selector: '[tinyEditor]',
  providers: [CUSTOM_VALUE_ACCESSOR]
})
export class TinymceEditorDirective implements AfterViewInit, ControlValueAccessor {
  private val : any = "";

  //selector string: Id of the host element
  @Input() selector: string;

  //Getter and setters for NgModel binding
  @Input()
  get ngModel(){
    return this.val;
  }

  set ngModel(val){
    this.val = val;
  }

  //This is used to update the model on view update
  @Output() ngModelChange = new EventEmitter();

  //All the options needed for tinymce editor
  private options = {
    plugins: [
      'advlist autolink lists link image charmap print preview hr anchor pagebreak',
      'searchreplace wordcount visualblocks visualchars fullscreen code',
      'insertdatetime media nonbreaking save table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern imagetools codesample'
    ],
    toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
    toolbar2: 'print preview media | forecolor backcolor emoticons | codesample',
    image_advtab: true
  }

  //ChangeDetectorRef is used to update angular component tree whenver a blur event occurs to trigger all the validations
  constructor(private changeDetectorRef: ChangeDetectorRef){
  }

  //registerOnChange, registerOnTouched, writeValue are methods need to be implemented for the interface ControlValueAccessor
  onChange = (_) => {};
  onTouched = () => {};

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  //This method is called whenever model gets updated
  writeValue(value: any): void {
    //This check is necessary because, this method gets called before editor gets initialised. Hence undefined/null pointer exceptions gets thrown
    console.log(tinymce.get(this.selector))
    if(tinymce.get(this.selector)){
      tinymce.get(this.selector).setContent(value, {format : 'raw'});
    }
  }

  //Update the component tree only when blur event happens. Otherwise following bug will occur.
  //Cursor position changes to 0 or the begining of the editor after every event.
  valueChange(){
    this.valueOnChange(false);
  }

  valueOnChange(change:boolean){
    this.val = tinymce.activeEditor.getContent();
    this.ngModelChange.emit(this.val);
    if(change){
      this.changeDetectorRef.detectChanges();
    }
  }

  ngAfterViewInit(){
    let that = this;
    let options : any = this.options;

    if(this.selector){
      options['selector'] = '#' + this.selector;
    }
    else{
      options['selector'] = ".wysiwyg";
    }

    options['height'] = 500;
    options['schema'] = "html5";
    options['theme'] = "modern";

    //write the model value to tinymce editor once gets initialised. And track input and change events
    options['init_instance_callback'] = function (editor) {
      that.writeValue(that.ngModel);
      editor.on('change', function (e) {
        that.valueChange();
      });
      editor.on('blur', function (e) {
        that.valueOnChange(true);
      });
      editor.on('keyup', function (e) {
        that.valueChange();
      });
      editor.on('PastePostProcess', function (e) {
        that.valueChange();
      });
    }

    tinymce.init(options);
  }
}
