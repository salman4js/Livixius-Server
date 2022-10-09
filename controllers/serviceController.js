const Service = require("../models/Services.js");
const Lodge = require("../models/Lodges.js");

const createService = async (req,res,next) => {
    try{
        const service = new Service({
            serviceType : req.body.servicetype,
            lodge : req.params.id
        })
        if(service){
            await Lodge.findByIdAndUpdate({_id : service.lodge}, {$push : {services : service._id }})
        }
        await service.save()
        res.send("Service added")
    } catch(err){
        res.send(err);
    }
}

const allServiceLodge = (req,res,next) => {
    Service.find({lodge : req.params.id})
    .then(data => {
        res.send(data)
        console.log(data);
    })
    .catch(err => {
        console.log(err)
        res.send(err)
    })
}

const serviceUpdater = (req,res,next) => {
    Service.findByIdAndUpdate(req.body.serviceId,{
        serviceType : req.body.servicetype,
        serviceQuestion : req.body.servicequestion
    })
    .then(data => {
        console.log(data)
        res.send("Service Updated")
    })
    .catch(err => {
        console.log(err)
        res.send("Error Occured, please check the console")
    })
}

const deleteService = (req,res,next) => {
    Service.findByIdAndDelete(req.body.serviceId)
    .then(data => {
        console.log(data)
        res.send("Service Deleted")
    })
    .catch(err => {
        console.log(err)
        res.send("Error Occured, Please check the console")
    })
}

module.exports = {
    createService, allServiceLodge, serviceUpdater, deleteService
}

