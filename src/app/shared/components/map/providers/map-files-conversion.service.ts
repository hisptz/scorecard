import {Injectable} from '@angular/core';


@Injectable()
export class MapFilesConversion {
  geometry: any;

  constructor() {
    this.geometry = this._getGeometry();
  }

  /***
   * *  KML FILE GENERATION FUNCTIONS FROM
   * *
   * *
   * */

  toGML(fileDataObject: Object, options?: Object) {
    options = options || {
        documentName: undefined,
        documentDescription: undefined,
        name: 'name',
        description: 'description',
        simplestyle: true,
        timestamp: 'timestamp'
      };

    return '<?xml version="1.0" encoding="utf-8" ?>' +
      this._tag('ogr:FeatureCollection',
        this._gml(fileDataObject, options)
        , [
          ['xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance'],
          ['xsi:schemaLocation', ''],
          ['xmlns:ogr', 'http://ogr.maptools.org/'],
          ['xmlns:gml', 'http://www.opengis.net/gml']
        ]);
  }

  private _gml(_, options) {
    if (!_.type) {
      return ''
    }

    switch (_.type) {
      case 'FeatureCollection':
        if (!_.features) {
          return ''
        }
        ;
        return _.features.map(this._gmlFeature(options)).join('');
      case 'Feature':
        return this._gmlFeature(options)(_);
      default:
        return this._gmlFeature(options)({
          type: 'Feature',
          geometry: _,
          properties: {}
        });
    }
  }

  private _gmlFeature(options) {
    return (_) => {
      if (!_.properties || !this.geometry.valid(_.geometry)) return '';
      const geometryString = this.geometry.any(_.geometry);
      if (!geometryString) return '';


      return this._tag('gml:featureMember', this._gmlFeatureAttributes(_, options));
    };
  }

  private _gmlFeatureAttributes(_, options) {
    const name = this._underScoreCharacter(options.documentName);
    return this._tag('ogr:' + name,
      this._tag('ogr:geometryProperty',
        this._getFeatureTagsAccordingToType(_.geometry.type, _)
      ) +
      this._preparePropertiesForGmlFormat(_.properties)
      , [['fid', name + "." + _.properties.id]]);
  }

  private _underScoreCharacter(characterString){
    characterString = characterString.replace(/[- &\/\\#,+()$~%.'":*?<>{}]/g, '_');
    return characterString;
  }

  private _getFeatureTagsAccordingToType(featureType, _): string {
    let format = "";
    if (featureType == "Point") {
      format = this._preparePointMembers(_.geometry.coordinates);
    }

    if (featureType == "LineString" || featureType == "MultiLineString") {

    }

    if (featureType == "Polygon" || featureType == "MultiPolygon") {
      format = this._tag('gml:' + featureType, this._preparePolygonMembers(_.geometry.coordinates), [['srsName', 'EPSG:4326']])
    }
    return format;

  }

  private _preparePointMembers(coordinates): string {
    const featureBlocks = this._prepareFeatureBlocks(coordinates);
    let blockTag = "";
    featureBlocks.forEach(featureBlock => {
      blockTag += this._getPointOuterBoundTypeGmlFormat(featureBlock);
    });
    return blockTag;
  }

  private _preparePolygonMembers(coordinates): string {
    const featureBlocks = this._prepareFeatureBlocks(coordinates);
    let blockTag = "";
    featureBlocks.forEach(featureBlock => {
      blockTag += this._tag('gml:polygonMember', this._getPolygonOuterBoundTypeGmlFormat(featureBlock));
    });

    return blockTag;
  }

  private sanitizeStringForXML(stringElement:string): string{

    if ( typeof stringElement == 'string' )
    {
      if (stringElement.indexOf('&')>=0){
        stringElement = stringElement.replace("&","&amp;");
      }

      if (stringElement.indexOf('<')>=0){
        stringElement = stringElement.replace("<","&lt;");
      }

      if (stringElement.indexOf('>')>=0){
        stringElement = stringElement.replace("<","&gt;");
      }
    }

    return stringElement;
  }

  private _getPointOuterBoundTypeGmlFormat(featureBlock): string {
    let format = "";

    if (this._isFinalBlock(featureBlock)) {
      format = this._tag('gml:Point', this._tag('gml:coordinates', this._convertfeatureCoordinateToGmlFormat(featureBlock)), [['srsName', 'EPSG:4326']])
    }
    return format;
  }

  private _getPolygonOuterBoundTypeGmlFormat(featureBlock): string {
    let format = "";
    if (!this._isFinalBlock(featureBlock)) {
      format = this._tag('gml:Polygon',
        this._tag('gml:outerBoundaryIs',
          this._tag('gml:LinearRing',
            this._tag('gml:coordinates', this._convertfeatureCoordinateToGmlFormat(featureBlock)))));
    }
    return format
  }

  private _prepareFeatureBlocks(coordinates): any[] {
    let blocks = [];
    if (this._isFinalBlock(coordinates)) {
      blocks.push(coordinates);
    } else {
      coordinates.forEach((coordinate, index) => {
        blocks.push(coordinate)
      });
    }
    return blocks;
  }

  private _isFinalBlock(block) {
    if (!isNaN(block[0])) {
      return true;
    }
    return false;
  }

  private _convertfeatureCoordinateToGmlFormat(coordinates) {
    let gmlCoordinates = this._getCoordinate(coordinates);
    return gmlCoordinates;
  }

  private _getCoordinate(coordinates) {
    let coord = "";
    coordinates.forEach((coordinate, index) => {
      if (!isNaN(coordinate)) {
        coord += coordinate;
        if (index == 0) {
          coord += ","
        } else {
          coord += " ";
        }
      } else {
        coord += this._getCoordinate(coordinate);
      }
    })

    return coord;
  }


  private _preparePropertiesForGmlFormat(properties): string {
    let propertyGml = "";
    const propertNames = Object.getOwnPropertyNames(properties);
    propertNames.forEach(property => [
      propertyGml += this._tag('ogr:' + this._underScoreCharacter(property),this.sanitizeStringForXML(properties[property]))
    ])
    return propertyGml;
  }

  /***
   * *  KML FILE GENERATION FUNCTIONS FROM
   * *
   * *
   * */

  toKML(fileDataObject: Object, options?: Object) {
    options = options || {
        documentName: undefined,
        documentDescription: undefined,
        name: 'name',
        description: 'description',
        simplestyle: true,
        timestamp: 'timestamp'
      };

    return '<?xml version="1.0" encoding="utf-8" ?>' +
      this._tag('kml',
        this._tag('Document',
          this._documentName(options) +
          this._documentDescription(options) +
          this._root(fileDataObject, options)
        ), [['xmlns', 'http://www.opengis.net/kml/2.2']]);

  }


  private _root(_, options) {

    if (!_.type) {
      return ''
    }
    const styleHashesArray = [];

    switch (_.type) {
      case 'FeatureCollection':
        if (!_.features) {
          return ''
        }
        ;
        return _.features.map(this._feature(options, styleHashesArray)).join('');
      case 'Feature':
        return this._feature(options, styleHashesArray)(_);
      default:
        return this._feature(options, styleHashesArray)({
          type: 'Feature',
          geometry: _,
          properties: {}
        });
    }
  }


  private _feature(options, styleHashesArray) {
    return (_) => {
      if (!_.properties || !this.geometry.valid(_.geometry)) return '';
      const geometryString = this.geometry.any(_.geometry);
      if (!geometryString) return '';

      let styleDefinition = '',
        styleReference = '';
      if (options.simplestyle) {

        const styleHash = this._hashStyle(_.properties);
        if (styleHash) {
          if (this.geometry.isPoint(_.geometry) && this._hasMarkerStyle(_.properties)) {
            if (styleHashesArray.indexOf(styleHash) === -1) {
              styleDefinition = this._markerStyle(_.properties, styleHash);
              styleHashesArray.push(styleHash);
            }
            styleReference = this._tag('styleUrl', '#' + styleHash);
          } else if ((this.geometry.isPolygon(_.geometry) || this.geometry.isLine(_.geometry)) &&
            this._hasPolygonAndLineStyle(_.properties)) {
            if (styleHashesArray.indexOf(styleHash) === -1) {
              styleDefinition = this._polygonAndLineStyle(_.properties, styleHash);
              styleHashesArray.push(styleHash);
            }
            styleReference = this._tag('styleUrl', '#' + styleHash);
          }
        }
      }
      return styleDefinition + this._tag('Placemark',
          this._name(_.properties, options) +
          this._description(_.properties, options) +
          // this._extendeddata(_.properties) +
          this._timestamp(_.properties, options) +
          geometryString +
          styleReference);
    };
  }


  private _documentName(options) {
    return (options.documentName !== undefined) ? this._tag('name', options.documentName) : '';
  }

  private _documentDescription(options) {
    return (options.documentDescription !== undefined) ? this._tag('description', options.documentDescription) : '';
  }


  private _name(_, options) {
    return _[options.name] ? this._tag('name', this._encode(_[options.name])) : '';
  }

  private _description(_, options) {
    return _[options.description] ? this._tag('description', this._encode(_[options.description])) : '';
  }

  private _timestamp(_, options) {
    return _[options.timestamp] ? this._tag('TimeStamp', this._tag('when', this._encode(_[options.timestamp]))) : '';
  }


  private _getGeometry(): Object {
    const geometry = {
      Point: (_) => {
        return this._tag('Point', this._tag('coordinates', _.coordinates.join(',')));
      },
      LineString: (_) => {
        return this._tag('LineString', this._tag('coordinates', this._linearring(_.coordinates)));
      },
      Polygon: (_) => {
        if (!_.coordinates.length) {
          return ''
        }
        ;
        const outer = _.coordinates[0],
          inner = _.coordinates.slice(1),
          outerRing = this._tag('outerBoundaryIs',
            this._tag('LinearRing', this._tag('coordinates', this._linearring(outer)))),
          innerRings = inner.map((i) => {
            return this._tag('innerBoundaryIs',
              this._tag('LinearRing', this._tag('coordinates', this._linearring(i))));
          }).join('');
        return this._tag('Polygon', outerRing + innerRings);
      },
      MultiPoint: (_) => {
        if (!_.coordinates.length) {
          return ''
        }
        ;
        return this._tag('MultiGeometry', _.coordinates.map((c) => {
          return geometry.Point({coordinates: c});
        }).join(''));
      },
      MultiPolygon: (_) => {
        if (!_.coordinates.length) {
          return ''
        }
        ;
        return this._tag('MultiGeometry', _.coordinates.map((c) => {
          return geometry.Polygon({coordinates: c});
        }).join(''));
      },
      MultiLineString: (_) => {
        if (!_.coordinates.length) {
          return ''
        }
        ;
        return this._tag('MultiGeometry', _.coordinates.map((c) => {
          return geometry.LineString({coordinates: c});
        }).join(''));
      },
      GeometryCollection: (_) => {
        return this._tag('MultiGeometry',
          _.geometries.map(geometry.any).join(''));
      },
      valid: (_) => {
        return _ && _.type && (_.coordinates ||
          _.type === 'GeometryCollection' && _.geometries && _.geometries.every(geometry.valid));
      },
      any: (_) => {
        if (geometry[_.type]) {
          return geometry[_.type](_);
        } else {
          return '';
        }
      },
      isPoint: (_) => {
        return _.type === 'Point' ||
          _.type === 'MultiPoint';
      },
      isPolygon: (_) => {
        return _.type === 'Polygon' ||
          _.type === 'MultiPolygon';
      },
      isLine: (_) => {
        return _.type === 'LineString' ||
          _.type === 'MultiLineString';
      }
    };
    return geometry;
  }

  private _linearring(_) {
    return _.map(function (cds) {
      return cds.join(',');
    }).join(' ');
  }

  // ## Data
  private _extendeddata(_) {
    return this._tag('ExtendedData', this._pairs(_).map(this._data).join(''));
  }

  private _data(_) {
    console.log(this._tag('value', '2'));
    return this._tag('Data', this._tag('value', this._encode(_[1])), [['name', this._encode(_[0])]]);
  }

// ## General helpers
  private _pairs(_) {
    const o = [];
    for (const i in _) o.push([i, _[i]]);
    return o;
  }

  // ## Marker style
  private _hasMarkerStyle(_) {
    return !!(_['marker-size'] || _['marker-symbol'] || _['marker-color']);
  }

  private _markerStyle(_, styleHash) {
    return this._tag('Style',
      this._tag('IconStyle',
        this._tag('Icon',
          this._tag('href', this._iconUrl(_)))) +
      this._iconSize(_), [['id', styleHash]]);
  }


  private _iconUrl(_) {
    const size = _['marker-size'] || 'medium',
      symbol = _['marker-symbol'] ? '-' + _['marker-symbol'] : '',
      color = (_['marker-color'] || '7e7e7e').replace('#', '');

    return 'https://api.tiles.mapbox.com/v3/marker/' + 'pin-' + size.charAt(0) +
      symbol + '+' + color + '.png';
  }

  private _iconSize(_) {
    return this._tag('hotSpot', '', [
      ['xunits', 'fraction'],
      ['yunits', 'fraction'],
      ['x', 0.5],
      ['y', 0.5]
    ]);
  }

// ## Polygon and Line style
  private _hasPolygonAndLineStyle(_) {
    for (const key in _) {
      if ({
          'stroke': true,
          'stroke-opacity': true,
          'stroke-width': true,
          'fill': true,
          'fill-opacity': true
        }[key]) {
        return true
      }
      ;
    }
  }

  private _polygonAndLineStyle(_, styleHash) {
    const lineStyle = this._tag('LineStyle', [
      this._tag('color', this._hexToKmlColor(_['stroke'], _['stroke-opacity']) || 'ff555555') +
      this._tag('width', _['stroke-width'] === undefined ? 2 : _['stroke-width'])
    ]);

    let polyStyle = '';

    if (_['fill'] || _['fill-opacity']) {
      polyStyle = this._tag('PolyStyle', [
        this._tag('color', this._hexToKmlColor(_['fill'], _['fill-opacity']) || '88555555')
      ]);
    }

    return this._tag('Style', lineStyle + polyStyle, [['id', styleHash]]);
  }


  private _hexToKmlColor(hexColor, opacity) {
    if (typeof hexColor !== 'string') return '';

    hexColor = hexColor.replace('#', '').toLowerCase();

    if (hexColor.length === 3) {
      hexColor = hexColor[0] + hexColor[0] +
        hexColor[1] + hexColor[1] +
        hexColor[2] + hexColor[2];
    } else if (hexColor.length !== 6) {
      return '';
    }

    const r = hexColor[0] + hexColor[1];
    const g = hexColor[2] + hexColor[3];
    const b = hexColor[4] + hexColor[5];

    let o = 'ff';
    if (typeof opacity === 'number' && opacity >= 0.0 && opacity <= 1.0) {
      o = (opacity * 255).toString(16);
      if (o.indexOf('.') > -1) o = o.substr(0, o.indexOf('.'));
      if (o.length < 2) o = '0' + o;
    }

    return o + b + g + r;
  }


// ## Style helpers
  private _hashStyle(_) {
    let hash = '';

    if (_['marker-symbol']) {
      hash = hash + 'ms' + _['marker-symbol']
    }
    ;
    if (_['marker-color']) {
      hash = hash + 'mc' + _['marker-color'].replace('#', '')
    }
    ;
    if (_['marker-size']) {
      hash = hash + 'ms' + _['marker-size']
    }
    ;
    if (_['stroke']) {
      hash = hash + 's' + _['stroke'].replace('#', '')
    }
    ;
    if (_['stroke-width']) {
      hash = hash + 'sw' + _['stroke-width'].toString().replace('.', '')
    }
    ;
    if (_['stroke-opacity']) {
      hash = hash + 'mo' + _['stroke-opacity'].toString().replace('.', '')
    }
    ;
    if (_['fill']) {
      hash = hash + '#' + _['fill'].replace('#', '')
    }
    ;
    if (_['fill-opacity']) {
      hash = hash + 'fo' + _['fill-opacity'].toString().replace('.', '')
    }
    ;

    return hash;
  }

  // HELPERS

  /**
   * @param {array} _ an array of attributes
   * @returns {string}
   */
  private _attr(_) {
    return (_ && _.length) ? (' ' + _.map(function (a) {
      return a[0] + '="' + a[1] + '"';
    }).join(' ')) : '';
  }

  /**
   * @param {string} el element name
   * @param {array} attributes array of pairs
   * @returns {string}
   */
  private _tagClose(el, attributes) {
    return '<' + el + this._attr(attributes) + '/>';
  }


  /**
   * @param {string} el element name
   * @param {string} contents innerXML
   * @param {array} attributes array of pairs
   * @returns {string}
   */
  private _tag(el, contents, attributes?) {
    return '<' + el + this._attr(attributes) + '>' + contents + '</' + el + '>';
  }

  /**
   * @param {string} _ a string of attribute
   * @returns {string}
   */
  private _encode(_) {
    return (_ === null ? '' : _.toString()).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }


}
