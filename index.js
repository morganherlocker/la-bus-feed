var request = require('request')
var turf = require('turf')
var fs = require('fs')

var buses = {}

setInterval(function(){
  request('http://api.metro.net/agencies/lametro/vehicles/', function(err, res, body){
    var data = JSON.parse(body).items
    var time = new Date()
    data.forEach(function(bus){
      if(!buses[bus.id]) {
        buses[bus.id] = {
          route_id: bus.route_id,
          run_id: bus.run_id,
          route: turf.linestring([], {route: bus.route_id, run: bus.run_id}),
          locations: turf.featurecollection([])
        }
      }

      var lastCoord = buses[bus.id].route.geometry.coordinates[buses[bus.id].route.geometry.coordinates.length - 1]
      if(buses[bus.id].route.geometry.coordinates.length === 0 || !(lastCoord[0] === bus.longitude && lastCoord[1] === bus.latitude)){
        buses[bus.id].route.geometry.coordinates.push([
            bus.longitude,
            bus.latitude
          ])

        /*buses[bus.id].locations.features.push(
          turf.point([
              bus.longitude,
              bus.latitude
            ],
            {time: time}
          ))*/
      }
    })
    fs.writeFileSync(__dirname+'/data.json', JSON.stringify(getTraces(buses)))
  })
}, 10000)

function getTraces (buses) {
  return turf.featurecollection(Object.keys(buses).map(function(bus){
    return buses[bus].route
  }).filter(function(route){
    if(route.geometry.coordinates.length > 1) return true
  }))
}