define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/Color',
    'esri/InfoTemplate',
    'esri/graphicsUtils'],
function(declare, BaseWidget, Query, QueryTask, SimpleFillSymbol, SimpleLineSymbol, Color, InfoTemplate, graphicsUtils) {
  return declare([BaseWidget], {

    baseClass: 'jimu-widget-mywidgetstatefilter',
    queryTask: null,
    selectionSymbol: null,
    infoTemplate: null,
    features: [],
    extent: null,

    constructor: function(){
        this.inherited(arguments);

        this.queryTask = new QueryTask("http://demographics6.arcgis.com/arcgis/rest/services/USA_Demographics_and_Boundaries_2016/MapServer/43");

        this.selectionSymbol =
            new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                    new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));
        this.infoTemplate = new InfoTemplate("Attributes", "State Name: ${STATE_NAME}<br>\
            Median Age: ${MEDAGE_CY}<br>Per Capita Income: $${PCI_CY}<br>Population: ${TOTPOP_CY}");
    },

    startup: function() {
        this.inherited(arguments);

        this._selectFeatures();       
    },

    _selectFeatures: function(){
        this.map.graphics.clear();

        document.getElementById('jimu_dijit_LoadingShelter_0').style.display = 'block';

        var query = new Query();
        
        query.returnGeometry = true;
        query.outFields = ["STATE_NAME", "MEDAGE_CY", "PCI_CY", "TOTPOP_CY"];
        
        query.where = '1 = 1';

        if(this.MEDAGE_from.value != '0')
            query.where += ' AND MEDAGE_CY >= ' + this.MEDAGE_from.value;
        
        if(this.MEDAGE_to.value != '0')
            query.where += ' AND MEDAGE_CY <= ' + this.MEDAGE_to.value;

        if(this.TOTPOP_from.value != '0')
            query.where += ' AND TOTPOP_CY >= ' + this.TOTPOP_from.value;
        
        if(this.TOTPOP_to.value != '0')
            query.where += ' AND TOTPOP_CY <= ' + this.TOTPOP_to.value;

        if(this.PCI_from.value != '0')
            query.where += ' AND PCI_CY >= ' + this.PCI_from.value;

        if(this.PCI_to.value != '0')
            query.where += ' AND PCI_CY <= ' + this.PCI_to.value;
        
        this.queryTask.execute(query, (function (featureSet){
            this.features = featureSet.features;

            var states = '<table><tr><th>State</th><th>Med. Age</th><th>Population</th><th>PCI</th></tr>';

            if(this.features.length){
                this.extent = graphicsUtils.graphicsExtent(this.features).expand(1.4);
                this.map.setExtent(this.extent);

                for (var i = 0; i < this.features.length; i++) {
                    this.features[i].setSymbol(this.selectionSymbol);
                    this.features[i].infoTemplate = this.infoTemplate;

                    this.map.graphics.add(this.features[i]);

                    states += '<tr><td>' + this.features[i].attributes.STATE_NAME + '</td><td>' + this.features[i].attributes.MEDAGE_CY + '</td><td>' 
                           + this.features[i].attributes.TOTPOP_CY + '</td><td>$ ' + this.features[i].attributes.PCI_CY + '</td></tr>';
                }

                
            }else{
                this.extent = null;
                states += '<tr><td colspan=4><center>No values</center></tr>';
            }

            this.states.innerHTML = states + '</table>';
            document.getElementById('jimu_dijit_LoadingShelter_0').style.display = 'none';            
        }).bind(this));
    },

    onOpen: function(){
        if(this.extent)
            this.map.setExtent(this.extent);
        
        for (var i = 0; i < this.features.length; i++)
            this.map.graphics.add(this.features[i]);
    },

    onClose: function(){
        this.map.graphics.clear();

        if(this.map.infoWindow.isShowing)
            this.map.infoWindow.hide();
    },
  });
});