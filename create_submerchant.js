var braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: '2677fhnwncmtzpdp',
  publicKey: '24ck88nkh4ytcdqt',
  privateKey: '9bddeff3ea84b7a89144e7a60d11c80f'
});

gateway.transaction.releaseFromEscrow("84739955", function(err, result) {
  console.log(result);
});

// merchantAccountParams = {
//   individual: {
//     firstName: "Johnlee",
//     lastName: "Doe",
//     email: "janee@14ladders.com",
//     dateOfBirth: "1981-11-19",
//     address: {
//       streetAddress: "111 Main St",
//       locality: "Chicago",
//       region: "IL",
//       postalCode: "60622"
//     }
//   },
//   funding: {
//     descriptor: "CutQueue",
//     destination: 'email',
//     email: "funding12@blueladders.com",
//   },
//   tosAccepted: true,
//   masterMerchantAccountId: "nationaluniversityofsingapore",
// };

// console.log('hello')

// gateway.merchantAccount.create(merchantAccountParams, function (err, result) {
//   console.log(result.success);
//   if (err) {
//     console.log(err);
//   }
//   if (result.success) {
//     console.log(result.merchantAccount.status)
//     console.log(result.merchantAccount.id)
//     console.log(result.merchantAccount.masterMerchantAccount.status)
//   }
// });


