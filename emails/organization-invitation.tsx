import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface OrganizationInvitationEmailProps {
  organizationName: string;
  inviterName: string;
  role: string;
  department?: string;
  invitationUrl: string;
  expiresIn: number;
}

export const OrganizationInvitationEmail = ({
  organizationName,
  inviterName,
  role,
  department,
  invitationUrl,
  expiresIn,
}: OrganizationInvitationEmailProps) => {
  const previewText = `You've been invited to join ${organizationName} on MindFlow`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>MindFlow</Heading>
            <Text style={subtitle}>Learning Management System</Text>
          </Section>

          <Section style={content}>
            <Heading style={h2}>You're Invited!</Heading>
            
            <Text style={text}>
              Hi there! <strong>{inviterName}</strong> has invited you to join{' '}
              <strong>{organizationName}</strong> on MindFlow.
            </Text>

            <Text style={text}>
              You'll be joining as a <strong>{role}</strong>
              {department && ` in the ${department} department`}.
            </Text>

            <Text style={text}>
              MindFlow is a powerful learning management system that helps organizations
              create, manage, and deliver engaging educational content.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={text}>
              This invitation will expire in <strong>{expiresIn} days</strong>.
            </Text>

            <Text style={text}>
              If you have any questions, feel free to reach out to {inviterName} or
              our support team.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This invitation was sent by MindFlow. If you didn't expect this email,
              you can safely ignore it.
            </Text>
            <Text style={footerText}>
              © 2024 MindFlow. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrganizationInvitationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  textAlign: 'center' as const,
  padding: '48px 0',
  backgroundColor: '#6366f1',
  borderRadius: '8px 8px 0 0',
  margin: '0 20px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
};

const subtitle = {
  color: '#e0e7ff',
  fontSize: '16px',
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
};

const content = {
  padding: '48px 20px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  padding: '0 20px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};
