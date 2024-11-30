import {
  Button,
  Space,
  Table,
  Modal,
  Input,
  Form,
  message,
  Typography,
} from "antd";
import axios from "axios";
import { useState, useEffect } from "react";
import API_ENDPOINTS from "../../Config/config";

function Material() {
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form] = Form.useForm();

  const { Title } = Typography;

  const fetchData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MATERIAL);
      setDataSource(response.data.result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showEditModal = (record) => {
    setIsEditMode(true);
    setIsAddMode(false);
    setSelectedRow(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const showDeleteModal = (record) => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedRow(record);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setIsAddMode(true);
    setIsEditMode(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        const payload = {
          id: selectedRow._id,
          ...values,
        };

        await axios.post(API_ENDPOINTS.MATERIAL, payload);
        message.success("Row updated successfully!");
      } else if (isAddMode) {
        await axios.post(API_ENDPOINTS.MATERIAL, values);
        message.success("Row added successfully!");
      }

      fetchData();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Operation failed:", error);
      message.error("Failed to perform the operation");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "FET",
      dataIndex: "fet",
      key: "fet",
    },
    {
      title: "YIELD (%)",
      dataIndex: "yeild",
      key: "yeild",
    },
    {
      title: "TARGET FEM (%)",
      dataIndex: "target_fem",
      key: "target_fem",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button type="danger" onClick={() => showDeleteModal(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      const payload = {
        status: "inactive",
        id: selectedRow._id,
      };

      await axios.post(
        API_ENDPOINTS.MATERIAL,
        payload
      );

      message.success("Row deleted successfully!");
      fetchData();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Failed to delete the row");
    }
  };
  return (
    <>
      <div>
        <Title level={2}>Material Management</Title>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={showAddModal}
        >
          Add Item
        </Button>
        <Table dataSource={dataSource} columns={columns} size="" />
        <Modal
          title={isEditMode ? "Edit Row" : isAddMode ? "Add Row" : "Delete Row"}
          visible={isModalVisible}
          onOk={isEditMode || isAddMode ? handleOk : handleDelete}
          onCancel={handleCancel}
          okText={isEditMode || isAddMode ? "Save" : "Delete"}
          cancelText="Cancel"
        >
          {isEditMode || isAddMode ? (
            <Form form={form} layout="vertical">
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input the name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="FET"
                name="fet"
                rules={[{ required: true, message: "Please input the FET!" }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                label="YIELD"
                name="yeild"
                rules={[{ required: true, message: "Please input the yield!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="TARGET FEM"
                name="target_fem"
                rules={[
                  { required: true, message: "Please input the target FEM!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          ) : (
            <p>
              Are you sure you want to delete the row with name:{" "}
              <b>{selectedRow?.name}</b>?
            </p>
          )}
        </Modal>
      </div>
    </>
  );
}

export default Material;
