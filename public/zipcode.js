function zipcode(){
    var zip=document.getElementById("pincode").value;
    let url = 'https://api.postalpincode.in/pincode/'+zip;

fetch(url)
.then(res => res.json())
.then((out) => {
console.log('Checkout this JSON! ', out);
if(out[0].Status=="Success")
{
var po =out[0].PostOffice[0].Name;
var dist =out[0].PostOffice[0].District;
var state =out[0].PostOffice[0].State;
var country =out[0].PostOffice[0].Country;

document.getElementById("res1").value=po;
document.getElementById("res2").value=dist;
document.getElementById("res3").value=state;
document.getElementById("res4").value=country;
}
else
{
  alert("Incorrect Zipcode");
  document.getElementById("res1").value="";
  document.getElementById("res2").value="";
  document.getElementById("res3").value="";
  document.getElementById("res4").value="";//to clear the data in the feild if you put incorrect pincode 2nd time
}
})
.catch(err => { throw err });
 } 