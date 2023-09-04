const Invoice = require("../../models/Invoice.schema");

const Lodge = require("../../models/Lodges");


// Add invoice memory!
const addInvoice = async (req,res,next) => {
      const result = await addInvoiceData(req.body);
      if(result){
        // Invoice gets stored successfully!
        res.status(200).json({
          success: true,
          message: "Invoice Memory Restored!"
        })
      } else {
        res.status(200).json({
          success: false,
          message: "Some functional error occured!"
        })
      }
}

// Helper function -- Add invoice!
async function addInvoiceData(invoiceData){
  // Get invoice count and add it with One!  
  const getCount = await Lodge.find({_id: invoiceData.lodgeId});
  const invoiceCount = getCount[0].invoiceCount + 1; // Updating the count + 1
  
  // Update the invoice count of the lodge!
  const updateCount = await updateInvoiceCount(invoiceData.lodgeId, invoiceCount);
  if(updateCount){
      try{
        const invoiceMemory = new Invoice({
          invoiceCount: invoiceCount,
          receiptId: invoiceData.receiptId,
          invoiceDate: invoiceData.invoiceDate,
          paymentDate: invoiceData.paymentDate,
          dateofCheckin: invoiceData.dateofCheckin,
          dateofCheckout: invoiceData.dateofCheckout,
          customerName: invoiceData.customerName,
          customerPhoneNumber: invoiceData.customerPhoneNumber,
          aadharCard: invoiceData.aadharCard,
          timeofCheckin: invoiceData.timeofCheckin,
          timeofCheckout: invoiceData.timeofCheckout,
          lodge: invoiceData.lodgeId
        })
        
        if(invoiceMemory){
          await invoiceMemory.save();
        }
        
        return true;
        
      } catch(err){
        return false;
      }
    }
}

// Helper Function -- Add invoice!
async function updateInvoiceCount(lodgeId, updatedCount){
  try{
    await Lodge.findByIdAndUpdate(lodgeId, {invoiceCount: updatedCount});
    return true;
  } catch(err){
    return false;
  }
}

// Get initial state of the invoice count!
async function getInitialStateOfInvoiceCount(req,res,next){
  const result = await updateInitialState(req.params.id);
  if(result.success){
    res.status(200).json({
      success: true,
      message: "Invoice count has been updated to initial state!",
      data: result.updated
    })
  } else {
    res.status(200).json({
      success: false,
      message: "Some functional error occured!"
    })
  }
}

// Helper function -- getInitialStateOfInvoiceCount!
async function updateInitialState(req){
  try{
    const updated = await Lodge.findByIdAndUpdate(lodgeId, {invoiceCount: 0});
    return {success: true, updated: updated}
  } catch(err){
    return {success: false, updated: ""}
  }
}

// Get all the invoice memory!
async function getAllInvoiceMemory(req,res,next){
  await Invoice.find({lodge: req.params.id})
    .then(data => {
      res.status(200).json({
        success: true,
        message: data
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occure while fetching invoive memory!"
      })
    })
}

async function deleteInvoiceMemory(req,res,next){
  await Invoice.findByIdAndDelete(req.body.invoiceMemoryId)
    .then(data => {
      res.status(200).json({
        success: true,
        message: "Invoice Memory deleted!"
      })
    })
    .catch(err => {
      res.status(200).json({
        success: false,
        message: "Some internal error occured while deleting the invoice memory!"
      })
    })
}

module.exports = {
  addInvoice, addInvoiceData, getAllInvoiceMemory, deleteInvoiceMemory, getInitialStateOfInvoiceCount, updateInitialState
}