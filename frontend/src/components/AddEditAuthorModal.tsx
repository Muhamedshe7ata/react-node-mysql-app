import { Modal } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { useState } from "react";
import { AuthorCreateEditForm } from "./AuthorCreateEditForm";
import { Author } from "../models/Author";

type Props = {
  isModalOpen: boolean;
  isEdit: boolean;
  initialValues?: Author;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOk: (values: Author) => Promise<void> | void;
};

export const AddEditAuthorModal = ({
  isModalOpen,
  isEdit,
  initialValues,
  setIsModalOpen,
  onOk,
}: Props) => {
  const [formInstance, setFormInstance] = useState<FormInstance>();

  const handleOk = async () => {
    try {
      const values = await formInstance?.validateFields();
      formInstance?.resetFields();
      // Await onOk in case it's async (for fetch)
      await onOk(values as Author);
      setIsModalOpen(false);
    } catch (error) {
      console.log("Failed:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={isEdit ? "Edit Author" : "Add Author"}
      open={isModalOpen}
      okText={isEdit ? "Save" : "Add"}
      onOk={handleOk}
      okButtonProps={{ autoFocus: true }}
      onCancel={handleCancel}
      width={750}
      destroyOnClose
    >
      <AuthorCreateEditForm
        initialValues={initialValues}
        onFormInstanceReady={(instance: FormInstance) => {
          setFormInstance(instance);
        }}
      />
    </Modal>
  );
};