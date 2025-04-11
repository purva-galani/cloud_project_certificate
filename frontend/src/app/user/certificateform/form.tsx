"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Observation {
  gas: string;
  before: string;
  after: string;
}

interface CertificateRequest {
  certificateNo: string;
  customerName: string;
  siteLocation: string;
  makeModel: string;
  range: string;
  serialNo: string;
  calibrationGas: string;
  gasCanisterDetails: string;
  dateOfCalibration: Date;
  calibrationDueDate: Date;
  observations: Observation[];
  engineerId: string;
  engineerName: string;
  status: string;
}


interface CertificateResponse {
  certificateId: string;
  message: string;
  downloadUrl: string;
}


interface Model {
  model_name: string;
  range: string;
}

interface engineer {
  id: string;
  name: string;
}

export default function GenerateCertificate() {
  const [formData, setFormData] = useState<CertificateRequest>({
    certificateNo: "", 
    customerName: "",
    siteLocation: "",
    makeModel: "",
    range: "",
    serialNo: "",
    calibrationGas: "",
    gasCanisterDetails: "",
    dateOfCalibration: new Date(),
    calibrationDueDate: new Date(),
    observations: [{ gas: "", before: "", after: "" }],
    engineerId: "", // ✅ added
    engineerName: "",
    status: "",
  });
  
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<number | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [engineers, setEngineers] = useState<engineer[]>([]);
  const [isLoadingEngineers, setIsLoadingEngineers] = useState(true);
  const [engineerError, setEngineerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/addcategory/getCategories');
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load models. Using default options.");
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/engineers/getEngineers");
        const data = await response.json();
        setEngineers(data);
      } catch (error) {
        console.error("Error fetching engineers:", error);
        setEngineerError("Failed to load engineers.");
      } finally {
        setIsLoadingEngineers(false);
      }
    };

    fetchEngineers();
  }, []);

  


  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    setFormData(prev => ({
      ...prev,
      dateOfCalibration: new Date(newStartDate)
    }));

    if (timePeriod) {
      const startDateObj = new Date(newStartDate);
      startDateObj.setMonth(startDateObj.getMonth() + timePeriod);
      const newEndDate = startDateObj.toISOString().split("T")[0];
      setEndDate(newEndDate);
      setFormData(prev => ({
        ...prev,
        dateOfCalibration: new Date(newStartDate),
        calibrationDueDate: startDateObj
      }));
    }
  };

  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = Number(e.target.value);
    setTimePeriod(period);

    if (startDate) {
      const startDateObj = new Date(startDate);
      startDateObj.setMonth(startDateObj.getMonth() + period);
      const newEndDate = startDateObj.toISOString().split("T")[0];
      setEndDate(newEndDate);
      setFormData(prev => ({
        ...prev,
        calibrationDueDate: startDateObj
      }));
    }
  };

  const updateEndDate = (start: string, months: number) => {
    const startDateObj = new Date(start);
    startDateObj.setMonth(startDateObj.getMonth() + months);
    const newEndDate = startDateObj.toISOString().split("T")[0];
    setEndDate(newEndDate);
    setFormData(prev => ({
      ...prev,
      calibrationDueDate: startDateObj
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let updatedObservations = formData.observations;
    let updatedRange = formData.range;

    if (name === "makeModel") {
      const selectedModel = models.find(m => m.model_name === value);
      updatedRange = selectedModel ? selectedModel.range : "";

      switch (value) {
        case "GMIleakSurveyor":
          updatedObservations = Array(3).fill({ gas: "", before: "", after: "" });
          break;
        case "GMIGT41Series":
          updatedObservations = Array(4).fill({ gas: "", before: "", after: "" });
          break;
        case "GMIGT44":
          updatedObservations = Array(3).fill({ gas: "", before: "", after: "" });
          break;
        default:
          updatedObservations = [{ gas: "", before: "", after: "" }];
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "makeModel" && { range: updatedRange, observations: updatedObservations })
    }));
  };

  const handleObservationChange = (index: number, field: keyof Observation, value: string) => {
    const updatedObservations = [...formData.observations];
    updatedObservations[index] = { ...updatedObservations[index], [field]: value };
    setFormData({ ...formData, observations: updatedObservations });
  };

  const addObservation = () => {
    if (formData.observations.length < 5) {
      setFormData({
        ...formData,
        observations: [...formData.observations, { gas: "", before: "", after: "" }]
      });
    }
  };

  const removeObservation = (index: number) => {
    const updatedObservations = [...formData.observations];
    updatedObservations.splice(index, 1);
    setFormData({ ...formData, observations: updatedObservations });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Form data before submission:', formData);

    try {
      // Ensure dates are properly formatted
      const submissionData = {
        ...formData,
        dateOfCalibration: startDate ? new Date(startDate) : null,
        calibrationDueDate: endDate ? new Date(endDate) : null
      };

      console.log('Submitting data:', submissionData);

      const response = await axios.post(
        "http://localhost:5000/api/v1/certificates/generateCertificate",
        submissionData
      );
      setCertificate(response.data);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.error || "Failed to generate certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.downloadUrl) return;

    try {
      const response = await axios.get(
        `http://localhost:5000${certificate.downloadUrl}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download certificate. Please try again.");
    }
  };  

  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-4">Generate Your Certificate</h1> */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <input
            type="text"
            name="customerName"
            placeholder="Enter Name"
            value={formData.customerName}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="siteLocation"
            placeholder="Enter Site Location"
            value={formData.siteLocation}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <select
            name="makeModel"
            value={formData.makeModel}
            onChange={handleChange}
            className="p-2 border rounded"
            required
            disabled={isLoadingModels}
          >
            <option value="">Select Make and Model</option>
            {isLoadingModels ? (
              <option value="" disabled>Loading models...</option>
            ) : models.length > 0 ? (
              models.map((model) => (
                <option key={model.model_name} value={model.model_name}>
                  {model.model_name}
                </option>
              ))
            ) : (
              <>
                <option value="GMIleakSurveyor">GMI leak Surveyor</option>
                <option value="GMIGT41Series">GMI GT 41 Series</option>
                <option value="GMIGT44">GMI GT 44</option>
              </>
            )}
          </select>
          <input
            type="text"
            name="range"
            placeholder="Range"
            value={formData.range}
            onChange={handleChange}
            className="p-2 border rounded"
            disabled
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          <input
            type="text"
            name="serialNo"
            placeholder="Enter Serial Number"
            value={formData.serialNo}
            onChange={handleChange}
            className="p-2 border rounded"

          />
          <input
            type="text"
            name="calibrationGas"
            placeholder="Enter Calibration Gas"
            value={formData.calibrationGas}
            onChange={handleChange}
            className="p-2 border rounded"

          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
          <textarea
            name="gasCanisterDetails"
            placeholder="Enter Gas Canister Details"
            value={formData.gasCanisterDetails}
            onChange={handleChange}
            className="p-2 border rounded"

          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <input
            type="date"
            name="dateOfCalibration"
            placeholder="Enter Date of Calibration"
            value={startDate}
            onChange={handleStartDateChange}
            className="p-2 border rounded"
            data-date-format="DD-MM-YYYY"
            min="2000-01-01"
            max="2100-12-31"
          />
          <select
            onChange={handleTimePeriodChange}
            className="border p-2 rounded-md"
          >
            <option value="">Select Period</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="9">9 Months</option>
            <option value="12">12 Months</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <input
            type="date"
            name="calibrationDueDate"
            placeholder="Enter Calibration Due Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setFormData(prev => ({
                ...prev,
                calibrationDueDate: new Date(e.target.value)
              }));
            }}
            className="p-2 border rounded"
            disabled={timePeriod !== null}
            data-date-format="DD-MM-YYYY"
            min="2000-01-01"
            max="2100-12-31"
          />
          <select
            name="engineerName"
            value={formData.engineerName}
            onChange={handleChange}
            className="p-2 border rounded"
            required
            disabled={isLoadingEngineers}
          >
            <option value="">Select Engineer Name</option>
            {isLoadingEngineers ? (
              <option value="" disabled>Loading engineers...</option>
            ) : engineerError ? (
              <option value="" disabled>Error loading engineers</option>
            ) : (
              engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.name}>
                  {engineer.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Select Status</option>
            <option value="Checked">Checked</option>
            <option value="Unchecked">Unchecked</option>
          </select>
        </div>

        <h2 className="text-lg font-bold mt-4">Observation Table</h2>
        <div className="flex justify-end mb-4">
          <button
            onClick={addObservation}
            className="bg-black-500 text-white px-4 py-2 border rounded hover:bg-gray-900"
            disabled={formData.observations.length >= 5}
          >
            Add Observation
          </button>
        </div>
        <table className="table-auto border-collapse border border-gray-500 rounded w-full">
          <thead>
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Gas</th>
              <th className="border p-2">Before Calibration</th>
              <th className="border p-2">After Calibration</th>
              <th className="border p-2">Remove</th>
            </tr>
          </thead>
          <tbody>
            {formData.observations.map((observation, index) => (
              <tr key={index}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    name="gas"
                    value={observation.gas}
                    onChange={(e) => handleObservationChange(index, 'gas', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    name="before"
                    value={observation.before}
                    onChange={(e) => handleObservationChange(index, 'before', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    name="after"
                    value={observation.after}
                    onChange={(e) => handleObservationChange(index, 'after', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => removeObservation(index)}
                    className="bg-black-500 text-white px-2 py-1 border rounded hover:bg-red-950"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {formData.observations.length === 0 && (
              <tr>
                <td colSpan={5} className="border p-2 text-center text-gray-500">
                  No observations added yet. Click "Add Observation" to add one.
                </td>
              </tr>
            )}
            {formData.observations.length >= 5 && (
              <tr>
                <td colSpan={5} className="border p-2 text-center text-yellow-600">
                  Maximum limit of 5 observations reached.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          type="submit"
          className="bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Certificate"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {certificate && (
        <div className="mt-4 text-center">
          <p className="text-green-600 mb-2">{certificate.message}</p>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download Certificate
          </button>
        </div>
      )}
    </div>
  );
}