const { monthlyStoreDocUpload } = require("../middleware/Upload");
const Doc = require("../models/Document");
const fs = require("fs");
const objectsToCsv = require("objects-to-csv");
const excelToJson = require("convert-excel-to-json");
const XLSX = require("xlsx");
const Record = require("../models/Record");
const getRecords = async (query) => {
  const data = await Doc.find(query, { _id: 0, __v: 0 });
  return data;
};
const jsonToCsv = async (req, res, data, store, month, year) => {
  const vdata = [
    { name: 1, age: 9 },
    { name: 9, age: 96 },
    { name: 90, age: 89 },
  ];
  console.log(data);
  const workSheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, workSheet, "students");
  XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  XLSX.writeFile(workbook, "studentData.xlsx");
  res.download("studentData.xlsx");
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
          artist_name: req.params.artist_name,
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
    ]);

    res.status(200).send({
      report,
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
          artist_name: req.params.artist_name,
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
          artist_name: req.params.artist_name,
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
          artist_name: req.params.artist_name,
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            storeName: "$storeName",
          },
          revanue: { $sum: "$income" },
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
exports.getRevanueMonthStoreReportForCharts = async (req, res) => {
  try {
    const barChartMonthReport = await Doc.aggregate([
      {
        $match: {
          artist_name: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          revanue: { $sum: "$income" },
        },
      },
    ]);
    const pieChartStoreReport = await Doc.aggregate([
      {
        $match: {
          artist_name: req.params.artist_name,
          year: req.params.year,
        },
      },
      {
        $group: {
          _id: {
            storeName: "$storeName",
          },
          revanue: { $sum: "$income" },
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
    const { artist_name, storeName,year,month } = req.params;
    if (storeName && month && year) {
      const data = await getRecords({ artist_name, storeName, month, year });
      res.status(200).send(data);
    } else if (storeName && year) {
      const data = await getRecords({ artist_name, storeName, year });
      return res.status(200).send(data);
    } else if (storeName) {
      const data = await getRecords({ artist_name, storeName });
      return res.status(200).send(data);
    } else if (year) {
      const data = await getRecords({ artist_name, year });
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
