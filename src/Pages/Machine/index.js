import React, { useState } from 'react';
import { Card, Button, Input, Alert, Row, Col, Typography, Modal, Form, Select, Popconfirm, Space } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  CloseCircleOutlined, 
  PlusOutlined,
  WarningOutlined,
  LineChartOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Machine = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKiln, setEditingKiln] = useState(null);
  const [kilns, setKilns] = useState([
    { id: 1, name: 'Kiln 1', status: 'Running', capacity: '30 Ton/h', lastUpdated: '20:26:34' },
  ]);

  const [form] = Form.useForm();

  const handleAddKiln = (values) => {
    const newKiln = {
      id: kilns.length + 1,
      name: values.name,
      status: values.status,
      capacity: `${values.capacity} Ton/h`,
      lastUpdated: new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    setKilns([...kilns, newKiln]);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleEditKiln = (values) => {
    const updatedKilns = kilns.map(kiln => {
      if (kiln.id === editingKiln.id) {
        return {
          ...kiln,
          name: values.name,
          status: values.status,
          capacity: `${values.capacity} Ton/h`,
          lastUpdated: new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        };
      }
      return kiln;
    });

    setKilns(updatedKilns);
    setIsModalOpen(false);
    setEditingKiln(null);
    form.resetFields();
  };

  const handleDeleteKiln = (id) => {
    setKilns(kilns.filter(kiln => kiln.id !== id));
  };

  const showEditModal = (kiln) => {
    setEditingKiln(kiln);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: kiln.name,
      status: kiln.status,
      capacity: parseInt(kiln.capacity),
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-700';
      case 'On-Hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'Shutdown':
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="m-0">Kiln Operations</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingKiln(null);
            setIsModalOpen(true);
            form.resetFields();
          }}
        >
          Add New Kiln
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {kilns.map((kiln) => (
          <Col xs={24} lg={12} key={kiln.id}>
            <Card 
              className={`${getStatusColor(kiln.status)} border-0`}
              extra={
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => showEditModal(kiln)}
                  />
                  <Popconfirm
                    title="Delete Kiln"
                    description="Are you sure you want to delete this kiln?"
                    onConfirm={() => handleDeleteKiln(kiln.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                    />
                  </Popconfirm>
                </Space>
              }
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <LineChartOutlined className="text-lg" />
                  <span className="font-medium">{kiln.name}</span>
                </div>
                <span>{kiln.status}</span>
              </div>

              <div className="mb-4">
                <div>Capacity: {kiln.capacity}</div>
                <div className="text-gray-500 text-sm">Last updated: {kiln.lastUpdated}</div>
              </div>

              <div className="mb-4">
                <Title level={5} className="mb-3">Status Control</Title>
                <div className="flex gap-2">
                  <Button 
                    type="primary" 
                    className="bg-green-500 hover:bg-green-600"
                    icon={<PlayCircleOutlined />}
                  >
                    Start
                  </Button>
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    icon={<PauseCircleOutlined />}
                  >
                    Hold
                  </Button>
                  <Button 
                    danger
                    icon={<CloseCircleOutlined />}
                  >
                    Shutdown
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <Title level={5} className="mb-3">Material Feed</Title>
                <Input placeholder="Set Material Feed" />
              </div>

              {kiln.id === 1 && (
                <Alert
                  message="Monitor temperature and pressure levels closely"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingKiln ? "Edit Kiln" : "Add New Kiln"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingKiln(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingKiln ? handleEditKiln : handleAddKiln}
        >
          <Form.Item
            name="name"
            label="Kiln Name"
            rules={[{ required: true, message: 'Please enter kiln name' }]}
          >
            <Input placeholder="Enter kiln name" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Running">Running</Option>
              <Option value="On-Hold">On-Hold</Option>
              <Option value="Shutdown">Shutdown</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity (Ton/h)"
            rules={[
              { required: true, message: 'Please enter capacity' },
            //   { type: 'number', message: 'Please enter a valid number' }
            ]}
          >
            <Input type="number" placeholder="Enter capacity" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={() => {
              setIsModalOpen(false);
              setEditingKiln(null);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingKiln ? 'Save Changes' : 'Add Kiln'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Machine;