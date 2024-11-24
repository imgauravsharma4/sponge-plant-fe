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
  import { useState } from "react";
  
  function Material() {
    const [dataSource, setDataSource] = useState([
      {
        key: "1",
        name: "Deepesh",
        fet: 32,
        yeild: "Rajpur",
        target_fem: "sdg",
      },
      {
        key: "2",
        name: "Gaurav",
        fet: 32,
        yeild: "Motharwala Street",
        target_fem: "sdg",
      },
    ]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [form] = Form.useForm();
  
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
  
    const handleOk = () => {
      if (isEditMode) {
        form.validateFields().then((values) => {
          const updatedData = dataSource.map((item) =>
            item.key === selectedRow.key ? { ...selectedRow, ...values } : item
          );
          setDataSource(updatedData);
          message.success("Row updated successfully!");
          setIsModalVisible(false);
        });
      } else if (isAddMode) {
        form.validateFields().then((values) => {
          const newKey = (dataSource.length + 1).toString(); 
          const newRow = { ...values, key: newKey };
          setDataSource([...dataSource, newRow]);
          message.success("Row added successfully!");
          setIsModalVisible(false);
        });
      } else {
        const updatedData = dataSource.filter(
          (item) => item.key !== selectedRow.key
        );
        setDataSource(updatedData);
        message.success("Row deleted successfully!");
        setIsModalVisible(false);
      }
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
    };
  
    const { Title } = Typography;
  
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
  
    return (
      <>
        <div>
          <Title level={2}>Material Management</Title>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={showAddModal}>
            Add Item
          </Button>
          <Table dataSource={dataSource} columns={columns} size="" />
          <Modal
            title={
              isEditMode
                ? "Edit Row"
                : isAddMode
                ? "Add Row"
                : "Delete Row"
            }
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={isEditMode || isAddMode ? "Save" : "Delete"}
            cancelText="Cancel"
          >
            {(isEditMode || isAddMode) ? (
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
                  rules={[
                    { required: true, message: "Please input the yield!" },
                  ]}
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
  