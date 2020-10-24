var express = require("express");
var router = express.Router();
var Customer = require("../models/customer");
var middleware = require("../middlewares");
var moment = require("moment");

router.get("/register", middleware.isAdmin, function(req,res) {
    res.render("customer/register", {page: "customer"});
});

router.post("/register", middleware.isAdmin, function(req,res) {
    Customer.create(req.body.customer, function(err,newCustomer) {
        if(err) {
            req.flash("error", "Something went wrong");
            return res.redirect("/customer/register")       
        }
        req.flash("success", "You successfully registered a customer");
        return res.redirect("/customer/details/contact");
    })
});

router.put("/:id/counter", middleware.isAdmin, function(req,res) {
    Customer.findById(req.params.id, async function(err, foundCustomer) {
        if(err || !foundCustomer) {
            req.flash("error", "Customer does not exist");
            return res.redirect("/home")
        }
        var count = await foundCustomer.counter + 1;
        if(foundCustomer.counter ===1) {
            Customer.findByIdAndUpdate(req.params.id, {counter: count, moveCreated: moment().format()}, function (err) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    return res.redirect("/customer/details/contact");
                }
                req.flash("success", "You successfully moved a customer");
                res.redirect("/customer/details/contact");
            })
        }else{
            Customer.findByIdAndUpdate(req.params.id, {counter: count}, function (err) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    return res.redirect("/customer/details/contact");
                }
                req.flash("success", "You successfully moved a customer");
                return res.redirect("/customer/details/contact");
            })
        }  
    })
})


router.get("/:id/edit", middleware.isAdmin, function(req,res) {
    Customer.findById(req.params.id, function(err, customer) {
        if(err || !customer) {
            req.flash("error", "Customer does not exist")
            return res.redirect("/home");
        }
            return res.render("customer/edit", {customer:customer, page: "edit"});
    })
})

router.put("/:id/edit", middleware.isAdmin, function(req,res) {
    Customer.findById(req.params.id, async function(err,foundCustomer) {
        if(err || !foundCustomer) {
            req.flash("error", "Customer does not exist");
            res.redirect("/home")
        } else{
            Customer.findByIdAndUpdate(req.params.id, req.body.customer, function(err) {
                if(err) {
                    req.flash("error", err.message);
                    return res.render("customer/edit", {customer:customer, page: "edit"})
                }
                req.flash("success", "You successfully edited a customer's info");
                res.redirect("/customer/details/contact")
            })            
        }
    })
});

router.get("/details/contact", middleware.isAdmin, function(req,res) {
    Customer.find({counter: 1}, function(err, foundCustomers) {
        if(err || !foundCustomers) {
            req.flash("error", "NO customer was found");
            return res.redirect("/home");
        }
        res.render("customer/contact", {customers: foundCustomers, page: "contact"})
    })
});

router.get("/details/picture", middleware.isAdmin, function(req,res) {
    Customer.find({counter: 2}, function(err, foundCustomers) {
        if(err || !foundCustomers) {
            req.flash("error", "No customer was found");
            return res.redirect("/home");
        }
        res.render("customer/picture", {customers: foundCustomers, page: "picture"})
    })
})

router.get("/details/inspection", middleware.isAdmin, function(req,res) {
    Customer.find({counter: 3}, function(err, foundCustomers) {
        if(err || !foundCustomers) {
            req.flash("error", "No customer was found");
            return res.redirect("/home");
        }
        res.render("customer/inspection", {customers: foundCustomers, page: "inspection"})
    })
})

router.delete("/:id/delete", middleware.isAdmin, function(req,res) {
    Customer.findById(req.params.id, function(err, foundCustomer) {
        if(err || !foundCustomer) {
            req.flash("error", "Customer does not exist");
            return res.redirect("/home")
        }
        Customer.findByIdAndRemove(req.params.id, function(err) {
            if(err){
                req.flash("error", "Something went wrong while deleting the customer");
                return res.redirect("/customer/details/contact")
            }
                req.flash("success", "You successfully deleted a customer");
                return res.redirect("/customer/details/contact");
        });
    });
});

router.get("/payment", middleware.isAdmin, function(req,res) {
    Customer.find({counter: 3}, function(err, foundCustomers) {
        if(err || !foundCustomers)  {
            req.flash("error", "Customers not found");
            return res.redirect("/home");
        }
        res.render("customer/payment", {customers: foundCustomers, page: "payment"});
    });
});

router.post("/:id/payment", middleware.isAdmin, function(req,res) {
    Customer.findByIdAndUpdate(req.params.id, {paid:true}, function(err) {
        if(err) {
            req.flash("error", "SOmething went wrong while updating the payment status");
            return res.redirect("/customer/payment");
        }
        req.flash("success", "You successfully confirmed that a customer has paid");
        return res.redirect("/customer/payment");
    })
})


module.exports = router;