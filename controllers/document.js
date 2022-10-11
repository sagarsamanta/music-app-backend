const Doc = require("../models/Document");
const data = {
  storeName: "ganna",
  year: "2022",
  month: "march",
  userName: "kk",
  revanue: 30,
  total: 20,
};
exports.addDocument = async (req, res, next) => {
  const newDoc = new Doc(data);
  const doc = await newDoc.save();
  res.status(200).send(doc);
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getRevenue = async (req, res) => {
  try {
    const value = await Doc.aggregate([
      {
        $match: {
          userName: "kk",
        },
      },
      {
        $group: {
          _id: {
            // year: "$year",
            // month: "$month",
            // storeName: "$storeName",
          },
          revanue: { $sum: "$revanue" },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    res.status(200).send(value);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
