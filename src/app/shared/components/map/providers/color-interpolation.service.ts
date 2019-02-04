import {Injectable} from '@angular/core';
import {Color} from "./color";

@Injectable()
export class ColorInterpolationService {

  private colorHigh: String;
  private colorLow: String;
  private colorType: String = "Hex";
  private ends: Array<any> = [Color, Color];
  private step: Array<any> = [];

  constructor() {
  }


  public getColorScaleFromHigLow(visualizationLayerSettings):any {

    const colorHigh: string = visualizationLayerSettings.colorHigh,
        colorLow: string = visualizationLayerSettings.colorLow,
        classes: number = visualizationLayerSettings.classes;

    let parseLow = this._colorParse(colorLow, 'hex');
    let parseHigh = this._colorParse(colorHigh, 'hex');
    this.ends[0] = new Color(parseLow[0], parseLow[1], parseLow[2]);
    this.ends[1] = new Color(parseHigh[0], parseHigh[1], parseHigh[2]);
    this._stepCalc(classes);
    let colors = this._mixPalete(classes);
    let colorScale = "";

    colors.forEach((color, colorIndex) => {
      colorScale += color.bg;
      if (colorIndex == color.length - 1) {
      } else {
        colorScale += ",";
      }

    })
    return colorScale.split(',');
  }


  private _mixPalete(steps: number) {
    let count = steps - 1;
    let palette: Array<any> = [];

    palette[0] = new Color(this.ends[0].red, this.ends[0].green, this.ends[0].blue);
    palette[count] = new Color(this.ends[1].red, this.ends[1].green, this.ends[1].blue);
    for (let paretteNumber = 1; paretteNumber < count; paretteNumber++) {
      let red = (this.ends[0].red + (this.step[0] * paretteNumber));
      let green = (this.ends[0].green + (this.step[1] * paretteNumber));
      let blue = (this.ends[0].blue + (this.step[2] * paretteNumber));
      palette[paretteNumber] = new Color(red, green, blue);
    }
    return palette;
  }

  private _colorParse(color, colorType) {
    if(!color) {
      return []
    }

    let m = 1;
    let base = 16;
    let num: Array<any> = [];
    color = color.toUpperCase();
    let colorRaw = color.replace('RGB', '').replace(/[\#\(]*/i, '');
    if (colorType == 'hex') {
      if (colorRaw.length == 3) {
        let colorSectionA = colorRaw.substr(0, 1);
        let colorSectionB = colorRaw.substr(1, 1);
        let colorSectionC = colorRaw.substr(2, 1);
        colorRaw = colorSectionA + colorSectionA + colorSectionB + colorSectionB + colorSectionC + colorSectionC;
      }
      num = new Array(colorRaw.substr(0, 2), colorRaw.substr(2, 2), colorRaw.substr(4, 2));
      base = 16;
    } else {
      num = colorRaw.split(',');
      base = 10;
    }

    if (colorType == 'rgbp') {
      m = 2.55
    }
    let ret = new Array(parseInt(num[0], base) * m, parseInt(num[1], base) * m, parseInt(num[2], base) * m);
    return (ret);

  }

  private _stepCalc(steps) {
    this.step[0] = (this.ends[1].red - this.ends[0].red ) / steps;
    this.step[1] = (this.ends[1].green - this.ends[0].green ) / steps;
    this.step[2] = (this.ends[1].blue - this.ends[0].blue) / steps;
  }

  private _setColorBounds(colorHigh: String, colorLow: String) {
    this.colorHigh = colorHigh;
    this.colorLow = colorLow;
  }


}
