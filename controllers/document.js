const { monthlyStoreDocUpload } = require("../middleware/Upload");
const Doc = require("../models/Document");
const fs = require("fs");
const excelToJson = require("convert-excel-to-json");
const Record = require("../models/Record");
const Album = require("../models/Album");
const Creadit = require("../models/Creadit");
const User = require("../models/Users");
const getRecords = async (query) => {
  const data = await Doc.find(query, { _id: 0, __v: 0 });
  return data;
};

const getMonthTotalIncome = async (artist_name, year) => {
  const total = await Doc.aggregate([
    {
      $match: {
        mtoolId: artist_name,
        year,
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        total: { $sum: "$total" },
      },
    },
  ]);
  let createMonthArray = {};
  if (total.length == 0) return [];
  total.forEach((item) => {
    const month = item._id.month;
    const sum = item.total;
    Object.assign(createMonthArray, { [month]: sum });
  });

  return createMonthArray;
};
const getStoreTotalIncome = async (artist_name, year) => {
  const total = await Doc.aggregate([
    {
      $match: {
        mtoolId: artist_name,
        year,
      },
    },
    {
      $group: {
        _id: {
          storeName: "$storeName",
        },
        total: { $sum: "$total" },
      },
    },
  ]);
  if (total.length == 0) return [];

  let createStoreArray = {};
  total.forEach((item) => {
    const month = item._id.storeName;
    const sum = item.total;
    Object.assign(createStoreArray, { [month]: sum });
  });
  return createStoreArray;
};
const getMonthTotalRevanue = async (artist_name, year) => {
  const total = await Doc.aggregate([
    {
      $match: {
        mtoolId: artist_name,
        year,
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        revanue: { $sum: "$royalty" },
      },
    },
  ]);
  let createMonthArray = {};
  if (total.length == 0) return [];
  total.forEach((item) => {
    const month = item._id.month;
    const sum = item.revanue;
    Object.assign(createMonthArray, { [month]: sum });
  });

  return createMonthArray;
};
const getStoreTotalRevanue = async (artist_name, year) => {
  const total = await Doc.aggregate([
    {
      $match: {
        mtoolId: artist_name,
        year,
      },
    },
    {
      $group: {
        _id: {
          storeName: "$storeName",
        },
        revanue: { $sum: "$royalty" },
      },
    },
  ]);
  if (total.length == 0) return [];
  console.log(total);
  let createStoreArray = {};
  total.forEach((item) => {
    const month = item._id.storeName;
    const sum = item.revanue;
    Object.assign(createStoreArray, { [month]: sum });
  });
  return createStoreArray;
};
exports.addDocument = async (req, res, next) => {
  try {
    const { storeName, year, month } = req.params;
    console.log(req.params);
    const isAlreadyUploed = await Record.findOne(req.params);
    if (isAlreadyUploed)
      return res.status(201).send({ message: "Record Alredy Exist!" });
    const newRecord = new Record(req.params);
    await newRecord.save();
    monthlyStoreDocUpload(req, res, function (err) {
      const result = excelToJson({
        sourceFile: `public/${req.file.filename}`,
        columnToKey: {
          "*": "{{columnHeader}}",
        },
        header: {
          rows: 1,
        },
      });
      if (result.Sheet1.length > 0) {
        const updatedRecord = result.Sheet1.map((record) => {
          //   const fiterArtistName=record.artist_name.split(",")[0]
          return { storeName, year, month, ...record };
        });

        Doc.insertMany(updatedRecord, (err, data) => {
          if (err) {
            return res.status(500).send("Failed to upload!");
          }
        });
        fs.unlinkSync(`public/${req.file.filename}`);
        return res
          .status(200)
          .json({ message: "Successfully uploaded!", data: newRecord });
      } else {
        return res.status(500).send(err);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getStreaminMonthStoreReportForTable = async (req, res) => {
  try {
    const report = await Doc.aggregate([
      {
        $match: {
          mtoolId: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            storeName: "$storeName",
          },
          streamming: { $sum: "$total" },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          Data: {
            $push: {
              // Month: "$_id.month",
              Store: "$_id.storeName",
              streamming: "$streamming",
            },
          },
        },
      },
    ]);
    const userStoreAccessContarol = await User.findOne({
      userName: req.params.artist_name,
    }).select("generalCategory crbtCategory bangladeshCategory");
    
    const storeTotal = await getStoreTotalIncome(
      req.params.artist_name,
      req.params.year
    );
    const monthTotal = await getMonthTotalIncome(
      req.params.artist_name,
      req.params.year
    );

    const formatData = report.map((item) => {
      value = {};
      value.month = item._id.month;
      item.Data.forEach((v) => {
        let store = v.Store;
        let strem = v.streamming;
        Object.assign(value, { [store]: strem });
      });
      return value;
    });
    sortByMonth(formatData);
    function sortByMonth(arr) {
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      arr.sort(function (a, b) {
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
    }

    res.status(200).send({
      year: req.params.year,
      Streamming: formatData,
      storeWiseTotal: storeTotal,
      monthWiseTotal: monthTotal,
      storeControl:userStoreAccessContarol,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getStreamingMonthStoreReportForCharts = async (req, res) => {
  try {
    const barChartMonthReport = await Doc.aggregate([
      {
        $match: {
          mtoolId: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    const pieChartStoreReport = await Doc.aggregate([
      {
        $match: {
          mtoolId: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            storeName: "$storeName",
          },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    res.status(200).send({
      barChartMonthReport,
      pieChartStoreReport,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.getRevanueMonthStoreReportForTable = async (req, res) => {
  try {
    const report = await Doc.aggregate([
      {
        $match: {
          mtoolId: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            storeName: "$storeName",
          },
          revanue: { $sum: "$royalty" },
          // revanue: { $sum: "$total" },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          Data: {
            $push: {
              // Month: "$_id.month",
              Store: "$_id.storeName",
              revanue: "$revanue",
            },
          },
        },
      },
    ]);

    const userStoreAccessContarol = await User.findOne({
      userName: req.params.artist_name,
    }).select("generalCategory crbtCategory bangladeshCategory");

    const formatData = report.map((item) => {
      value = {};
      value.month = item._id.month;
      item.Data.forEach((v) => {
        let store = v.Store;
        let revanue = v.revanue;
        Object.assign(value, { [store]: revanue });
      });
      return value;
    });

    sortByMonth(formatData);
    function sortByMonth(arr) {
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      arr.sort(function (a, b) {
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
    }

    const storeTotal = await getStoreTotalRevanue(
      req.params.artist_name,
      req.params.year
    );
    const monthTotal = await getMonthTotalRevanue(
      req.params.artist_name,
      req.params.year
    );
    res.status(200).send({
      year: req.params.year,
      Revanue: formatData,
      storeWiseTotal: storeTotal,
      monthWiseTotal: monthTotal,
      storeControl: userStoreAccessContarol,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getRevanueMonthStoreReportForCharts = async (req, res) => {
  try {
    const barChartMonthReport = await Doc.aggregate([
      {
        $match: {
          mtoolId: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          revanue: { $sum: "$royalty" },
        },
      },
    ]);
    const pieChartStoreReport = await Doc.aggregate([
      {
        $match: {
          mtoolId: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            storeName: "$storeName",
          },
          revanue: { $sum: "$royalty" },
        },
      },
    ]);
    res.status(200).send({
      barChartMonthReport,
      pieChartStoreReport,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.removeUploadedExcel = async (req, res) => {
  try {
    const { storeName, year, month } = req.params;
    const count = await Doc.deleteMany({ storeName, year, month });
    const record = await Record.deleteOne(req.params);
    res.status(200).send({ count, record });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getUserReports = async (req, res) => {
  try {
    const { artist_name, storeName, year, month } = req.params;
    console.log(req.params);
    if (storeName && month && year) {
      const data = await getRecords({
        mtoolId: artist_name,
        storeName,
        month,
        year,
      });
      res.status(200).send(data);
    } else if (storeName && year) {
      const data = await getRecords({ mtoolId: artist_name, storeName, year });
      return res.status(200).send(data);
    } else if (storeName) {
      const data = await getRecords({ mtoolId: artist_name, storeName });
      return res.status(200).send(data);
    } else if (year) {
      const data = await getRecords({ mtoolId: artist_name, year });
      return res.status(200).send(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getAllUplodedRecords = async (req, res) => {
  try {
    const record = await Record.find().sort({ createdAt: "desc" });
    res.status(200).send(record);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.getYear = async (req, res) => {
  const { artist_name } = req.params;
  const data = await Doc.find({ artist_name: artist_name }).distinct("year");
  try {
    res.status(200).send(data);
  } catch (error) {
    console.log(err);
    res.status(500).send(err);
  }
};
exports.getFinancialReport = async (req, res) => {
  try {
    const { artist_name } = req.params;
    const { _id } = req.user;
    const totalEarning = await Doc.aggregate([
      {
        $match: {
          mtoolId: artist_name,
          // year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            // month: "$month",
          },
          revanue: { $sum: "$royalty" },
        },
      },
    ]);
    const totalPaymentRealese = await Creadit.aggregate([
      {
        $match: {
          artist_name: artist_name,
          // year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            // month: "$month",
          },
          paymentRelease: { $sum: "$paymentRelease" },
        },
      },
    ]);
    const totalRealeasedAlbum = await Album.countDocuments({
      user_id: _id,
    });
    if (totalEarning.length > 0) {
      res.status(200).send({
        earning: totalEarning[0]?.revanue || 0,
        albumCount: totalRealeasedAlbum || 0,
        paymentRelease: totalPaymentRealese[0]?.paymentRelease || 0,
      });
    } else {
      res.status(200).send({
        earning: 0,
        albumCount: totalRealeasedAlbum,
        paymentRelease: totalPaymentRealese[0]?.paymentRelease || 0,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
