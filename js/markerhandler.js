var elementsArray = [];
var A= ["H","Li","Na","K"];
var B= ["F","Cl","Br","I"]

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    var compounds = await this.getCompounds();

    this.el.addEventListener("markerFound", () => {
      var element_name= this.el.getAttribute("element_name");
      var barcode_value= this.el.getAttribute("value");

      elementsArray.push({element_name: element_name, barcode_value: barcode_value})
      compounds[barcode_value]['compounds'].map(item=>{
        var compound= document.querySelector(`#${item.compound_name}-${barcode_value}`)
        compound.setAttribute("visible",false)
      })
      var atom=  document.querySelector(`#${element_name}-${barcode_value}`)
      atom.setAttribute("visible",true)
    });

    this.el.addEventListener("markerLost", () => {
      var element_name= this.el.getAttribute("element_name");
      var index= elementsArray.findIndex(x=> x.element_name===element_name)
      if(index>-1){
        elementsArray.splice(index,1)
      }
    });
  },


  tick: function () {
    if(elementsArray.length>1){
      var length= elementsArray.length
      var distance= null
      var compound = this.getCompound()
      if(length === 2){
        var marker1= document.querySelector(`#marker-${elementsArray[0].barcode_value}`)
        var marker2= document.querySelector(`#marker-${elementsArray[1].barcode_value}`)
        distance= this.getDistance(marker1, marker2)
        if(distance<1.5){
          if(compound!== undefined){
            this.showCompound(compound)

          }
        }
      }
    }
  },


  //Calculate distance between two position markers
  getDistance: function (elA, elB) {
    return elA.object3D.position.distanceTo(elB.object3D.position)
  },  
  getCompound: function () {
    for(var el of elementsArray){
      if (A.includes(el.element_name)){
        var compound= el.element_name
        for(var i of elementsArray){
          if(B.includes(i.element_name)){
            compound= compound+i.element_name
            return{name: compound, value:el.barcode_value}
          }
        }
      }
    }
  },

  showCompound: function (compound) {
    //Hide elements
    elementsArray.map(item => {
      var el = document.querySelector(`#${item.element_name}-${item.barcode_value}`);
      el.setAttribute("visible", false);
    });
    //Show Compound
    var compound = document.querySelector(`#${compound.name}-${compound.value}`);
    compound.setAttribute("visible", true);
  },
  getCompounds: function () {
    // NOTE: Use ngrok server to get json values
    return fetch("js/compoundList.json")
      .then(res => res.json())
      .then(data => data);
  },
});
