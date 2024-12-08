import { Button, Space, Table, Modal, Input, Form, Typography } from "antd";
import { useState, useEffect } from "react";
import { APIS } from "../../APIs/Apis";
import { options } from "../../Config/options";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ToastMessage from "../../Component/ToastMessage/ToastMessage";
const { defaultStatus, successMessage, errorMessage, messageStatus } = options;

const Material = () => {
  const [reload, setReload] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form] = Form.useForm();
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
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record)}
          />
        </Space>
      ),
    },
  ];
  const { Title } = Typography;

  const fetchData = async () => {
    const response = await APIS.getAllMaterial();
    setDataSource(response);
  };

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
    const values = await form.validateFields();
    const payload = {
      ...values,
      ...(isEditMode &&
        selectedRow?._id &&
        selectedRow?._id?.length > 1 && {
          id: selectedRow._id,
        }),
    };
    APIS.addAndEditMaterial(payload)
      .then((res) => {
        ToastMessage(
          messageStatus.SUCCESS,
          successMessage.UPDATE_SUCCESS_MESSAGE("Material")
        );
        setReload(!reload);
        setIsModalVisible(false);
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        ToastMessage(messageStatus.ERROR, errorMessage.SERVER_ERROR);
        setIsModalVisible(false);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = async () => {
    const payload = {
      status: defaultStatus.INACTIVE,
      id: selectedRow._id,
    };

    APIS.addAndEditMaterial(payload)
      .then((res) => {
        ToastMessage(
          messageStatus.SUCCESS,
          successMessage.DELETE_SUCCESS_MESSAGE("Material")
        );
        setReload(!reload);
        setIsModalVisible(false);
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        ToastMessage(messageStatus.ERROR, errorMessage.SERVER_ERROR);
      });
  };

  useEffect(() => {
    fetchData();
  }, [reload]);
  return (
    <>
      <div>
        <Title level={2}>Material Management</Title>
        <Button
          type='primary'
          style={{ marginBottom: 16 }}
          onClick={showAddModal}
        >
          Add Item
        </Button>
        <Table dataSource={dataSource} columns={columns} size='' />
        <Modal
          title={
            isEditMode ? "Edit Row" : isAddMode ? "Add Row" : "Delete Material"
          }
          visible={isModalVisible}
          onOk={isEditMode || isAddMode ? handleOk : handleDelete}
          onCancel={handleCancel}
          okText={isEditMode || isAddMode ? "Save" : "Delete"}
          cancelText='Cancel'
        >
          {isEditMode || isAddMode ? (
            <Form form={form} layout='vertical'>
              <Form.Item
                label='Name'
                name='name'
                rules={[{ required: true, message: "Please input the name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label='FET'
                name='fet'
                rules={[{ required: true, message: "Please input the FET!" }]}
              >
                <Input type='number' />
              </Form.Item>
              <Form.Item
                label='YIELD'
                name='yeild'
                rules={[{ required: true, message: "Please input the yield!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label='TARGET FEM'
                name='target_fem'
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
};

export default Material;
