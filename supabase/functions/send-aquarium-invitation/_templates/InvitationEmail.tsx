
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface InvitationEmailProps {
  aquariumName: string;
  ownerName: string;
  invitedEmail: string;
  permission: string;
  acceptUrl: string;
}

export const InvitationEmail = ({
  aquariumName,
  ownerName,
  invitedEmail,
  permission,
  acceptUrl,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to view {aquariumName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🐠 Aquarium Invitation</Heading>
        
        <Text style={text}>
          Hi there!
        </Text>
        
        <Text style={text}>
          <strong>{ownerName}</strong> has invited you to access their aquarium "<strong>{aquariumName}</strong>" 
          as a <strong>{permission}</strong>.
        </Text>
        
        <Text style={text}>
          {permission === 'editor' 
            ? 'As an editor, you can view and make changes to this aquarium.'
            : 'As a viewer, you can view all the details of this aquarium.'}
        </Text>
        
        <Section style={buttonContainer}>
          <Button href={acceptUrl} style={button}>
            Accept Invitation
          </Button>
        </Section>
        
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        
        <Text style={linkText}>
          {acceptUrl}
        </Text>
        
        <Text style={footerText}>
          If you didn't expect this invitation, you can safely ignore this email.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The AquaManager Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InvitationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const linkText = {
  color: '#007ee6',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
};

const footerText = {
  color: '#666',
  fontSize: '14px',
  margin: '24px 0 16px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  margin: '32px 0 0',
};
