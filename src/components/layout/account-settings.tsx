import { Button, Card, Drawer, Form, Input, Spin } from "antd";
import React from "react";
import Text from "../text";
import { CloseOutlined } from "@ant-design/icons";
import CustomAvatar from "../custom-avatar";
import { getNameInitial } from "@/utilities";
import { SaveButton } from "@refinedev/antd";
import { HttpError, useForm } from "@refinedev/core";
import { GetFields, GetVariables } from "@refinedev/nestjs-query";
import {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "@/graphql/types";
import { UPDATE_USER_MUTATION } from "@/graphql/mutations";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const { queryResult } = useForm<
    GetFields<UpdateUserMutation>,
    HttpError,
    GetVariables<UpdateUserMutationVariables>
  >({
    mutationMode: "optimistic",
    resource: "users",
    action: "edit",
    id: userId,
    meta: {
      gqlMutation: UPDATE_USER_MUTATION,
    },
  });

  const { avatarUrl, name } = queryResult?.data?.data || {};

  if (queryResult?.isLoading) {
    return (
      <Drawer
        open={opened}
        width={755}
        styles={{
          body: {
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}>
        <Spin />
      </Drawer>
    );
  }

  const closeModal = () => {
    setOpened(false);
  };

  return (
    <Drawer
      onClose={closeModal}
      open={opened}
      width={755}
      styles={{
        body: {
          background: "#f5f5f5",
          padding: 0,
        },
        header: {
          display: "none",
        },
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#fff",
        }}>
        <Text strong>Account Settings</Text>
        <Button
          type='text'
          icon={<CloseOutlined />}
          onClick={() => closeModal()}
        />
      </div>
      <div
        style={{
          padding: "16px",
        }}>
        <Card>
          <Form layout='vertical'>
            <CustomAvatar
              shape='square'
              src={avatarUrl}
              name={getNameInitial(name || "")}
              style={{
                width: 96,
                height: 96,
                marginBottom: "24px",
              }}
            />
            <Form.Item label='Name' name='name'>
              <Input placeholder='Name' />
            </Form.Item>
            <Form.Item label='Email' name='email'>
              <Input placeholder='email' />
            </Form.Item>
            <Form.Item label='Job title' name='jobTitle'>
              <Input placeholder='jobTitle' />
            </Form.Item>
            <Form.Item label='Phone' name='phone'>
              <Input placeholder='Timezone' />
            </Form.Item>
          </Form>
          <SaveButton style={{ display: "block", marginLeft: "auto" }} />
        </Card>
      </div>
    </Drawer>
  );
};

export default AccountSettings;
