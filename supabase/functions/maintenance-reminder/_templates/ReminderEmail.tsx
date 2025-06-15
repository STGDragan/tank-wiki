
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface Task {
  task: string;
  due_date: string;
}

interface ReminderEmailProps {
  fullName: string | null;
  upcomingTasks: Task[] | null;
  overdueTasks: Task[] | null;
}

export const ReminderEmail = ({ fullName, upcomingTasks, overdueTasks }: ReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Aquarium Maintenance Reminder</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {fullName || 'there'},</Heading>
        <Text style={text}>This is a friendly reminder about your upcoming and overdue aquarium maintenance tasks.</Text>

        {overdueTasks && overdueTasks.length > 0 && (
          <Section>
            <Heading as="h2" style={h2}>Overdue Tasks</Heading>
            {overdueTasks.map((task, index) => (
              <Row key={`overdue-${index}`}>
                <Column>
                  <Text style={{ ...taskItem, color: '#d9534f' }}>
                    <strong>{task.task}</strong> - Due on {new Date(task.due_date).toLocaleDateString()}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {upcomingTasks && upcomingTasks.length > 0 && (
          <Section>
            <Heading as="h2" style={h2}>Upcoming Tasks (Next 7 Days)</Heading>
            {upcomingTasks.map((task, index) => (
              <Row key={`upcoming-${index}`}>
                <Column>
                  <Text style={taskItem}>
                    <strong>{task.task}</strong> - Due on {new Date(task.due_date).toLocaleDateString()}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        <Text style={text}>Please log in to your dashboard to mark them as complete or manage your schedule.</Text>
        
        <Text style={footer}>
          Happy fishkeeping!
          <br />
          The AquaManager Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ReminderEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};
const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 30px',
};
const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '30px 0 10px',
  padding: '0 30px',
};
const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 30px',
};
const taskItem = {
  ...text,
  padding: '0 30px',
  lineHeight: '20px',
};
const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 30px',
};
