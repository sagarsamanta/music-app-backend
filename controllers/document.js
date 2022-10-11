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

exports.getMonthStoreReport = async (req, res) => {
  try {
    const monthReport = await Doc.aggregate([
      {
        $match: {
          userName: req.body.userName,
        },
      },
      {
        $group: {
          _id: {
            // year: "$year",
            month: "$month",
            // storeName: "$storeName",
          },
          revanue: { $sum: "$revanue" },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    const storeReport = await Doc.aggregate([
      {
        $match: {
          userName: req.body.userName,
        },
      },
      {
        $group: {
          _id: {
            // year: "$year",
            // month: "$month",
            storeName: "$storeName",
          },
          revanue: { $sum: "$revanue" },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    res.status(200).send({
      storeReport: storeReport,
      monthReport: monthReport,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getStreamingReport = async (req, res) => {
  try {
    const report = await Doc.aggregate([
      {
        $match: {
          userName: req.body.userName,
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            storeName: "$storeName",
          },
          //   revanue: { $sum: "$revanue" },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    res.status(200).send({
      report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getRevanueReport = async (req, res) => {
  try {
    const report = await Doc.aggregate([
      {
        $match: {
          userName: req.body.userName,
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            storeName: "$storeName",
          },
          revanue: { $sum: "$revanue" },
          //   streamming: { $sum: "$total" },
        },
      },
    ]);

    res.status(200).send({
      report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
