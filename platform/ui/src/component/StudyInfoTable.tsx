import React from 'react';
import moment from 'moment';

export const StudyInfoTable = ({ tableData }) => {
  const formattedDate = tableData?.Date
    ? moment(tableData.Date, 'D/M/YYYY, h:mm:ss a').format('DD-MMMM-YYYY')
    : '';

  return (
    <table className="mb-2 min-w-full border text-center text-sm font-light text-white">
      <thead className="whitespace- border-b font-medium">
        <tr>
          <th
            scope="col"
            className="border-r"
          >
            Patient ID
          </th>
          <th
            scope="col"
            className="border-r"
          >
            Patient Name
          </th>
          <th
            scope="col"
            className="border-r"
          >
            Date
          </th>
          <th
            scope="col"
            className="border-r"
          >
            Study
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b font-medium">
          <td className="border-r">{tableData?.patientID}</td>
          <td className="border-r">{tableData?.name}</td>
          <td className="border-r">{formattedDate}</td>
          <td className="border-r">{tableData?.study}</td>
        </tr>
      </tbody>
      <thead className="border-b font-medium">
        <tr>
          <th
            scope="col"
            className="border-r"
          >
            Gender
          </th>
          <th
            scope="col"
            className="border-r"
          >
            Modality
          </th>
          <th
            scope="col"
            className="border-r"
          >
            Age
          </th>
          <th
            scope="col"
            className="border-r"
          >
            Ref Doctor
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b font-medium">
          <td className="border-r">{tableData?.PatientSex}</td>
          <td className="border-r">{tableData?.modality}</td>
          <td className="border-r">{tableData?.PatientAge}</td>
          <td className="border-r">{tableData?.ReferringPhysicianName}</td>
        </tr>
      </tbody>
    </table>
  );
};
