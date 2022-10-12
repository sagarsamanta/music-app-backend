const { monthlyStoreDocUpload } = require("../middleware/Upload");
const Doc = require("../models/Document");
const fs = require("fs");
const objectsToCsv = require("objects-to-csv");
const excelToJson = require("convert-excel-to-json");
const XLSX = require("xlsx");
const getRecords = async (query) => {
  const data = await Doc.find(query);
  console.log(data);
  return data;
};
const jsonToCsv = async (req, res, data, store, month, year) => {
  const workSheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new;
  XLSX.utils.book_append_sheet(workbook, workSheet, "students");
  XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  XLSX.writeFile(workbook, "studentData.xlsx");
};

exports.addDocument = async (req, res, next) => {
  try {
    monthlyStoreDocUpload(req, res, function (err) {
      const { storeName, month, year } = req.body;
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
          return { storeName, month, year, ...record };
        });

        Doc.insertMany(updatedRecord, (err, data) => {
          if (err) {
            console.log(err);
            return res.status(500).send("Failed to upload!");
          }
        });
        fs.unlinkSync(`public/${req.file.filename}`);
        return res.status(200).json({ message: "Successfully uploaded!" });
      } else {
        return res.status(500).send(err);
      }
    });
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
          artist_name: req.body.artist_name,
        },
      },
      {
        $group: {
          _id: {
            // year: "$year",
            month: "$month",
            // storeName: "$storeName",
          },
          revanue: { $sum: "$income" },
          streamming: { $sum: "$total" },
        },
      },
    ]);
    const storeReport = await Doc.aggregate([
      {
        $match: {
          artist_name: req.body.artist_name,
        },
      },
      {
        $group: {
          _id: {
            // year: "$year",
            // month: "$month",
            storeName: "$storeName",
          },
          revanue: { $sum: "$income" },
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
          artist_name: req.body.artist_name,
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
          artist_name: req.body.artist_name,
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
exports.removeUploadedExcel = async (req, res) => {
  try {
    const { storeName, year, month } = req.params;
    const count = await Doc.deleteMany({ storeName, year, month });
    res.status(200).send(count);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getUserReports = async (req, res) => {
  try {
    const { artist_name, storeName, month, year } = req.body;
    if (storeName && month && year) {
      const data = await getRecords({ artist_name, storeName, month, year });
      await jsonToCsv(req, res, data, storeName, year, month);
      //   return res.status(200).send(data);
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
