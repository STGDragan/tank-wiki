
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
  advanceTasks: Task[] | null;
  dueTodayTasks: Task[] | null;
  overdueTasks: Task[] | null;
  escalationTasks: Task[] | null;
  reminderIntervals: number[];
}

export const ReminderEmail = ({ 
  fullName, 
  advanceTasks, 
  dueTodayTasks, 
  overdueTasks, 
  escalationTasks,
  reminderIntervals 
}: ReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Aquarium Maintenance Reminder</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {fullName || 'there'},</Heading>
        <Text style={text}>This is your personalized aquarium maintenance reminder.</Text>

        {escalationTasks && escalationTasks.length > 0 && (
          <Section>
            <Heading as="h2" style={{ ...h2, color: '#d73502' }}>🚨 Urgent: Tasks Need Immediate Attention</Heading>
            <Text style={{ ...text, color: '#d73502', fontWeight: 'bold' }}>
              These tasks have been overdue for several days and require immediate action:
            </Text>
            {escalationTasks.map((task, index) => (
              <Row key={`escalation-${index}`}>
                <Column>
                  <Text style={{ ...taskItem, color: '#d73502', fontWeight: 'bold' }}>
                    ⚠️ <strong>{task.task}</strong> - Due on {new Date(task.due_date).toLocaleDateString()}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {overdueTasks && overdueTasks.length > 0 && (
          <Section>
            <Heading as="h2" style={{ ...h2, color: '#d9534f' }}>Overdue Tasks</Heading>
            <Text style={{ ...text, color: '#d9534f' }}>
              These tasks are past their due date:
            </Text>
            {overdueTasks.map((task, index) => (
              <Row key={`overdue-${index}`}>
                <Column>
                  <Text style={{ ...taskItem, color: '#d9534f' }}>
                    🔴 <strong>{task.task}</strong> - Due on {new Date(task.due_date).toLocaleDateString()}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {dueTodayTasks && dueTodayTasks.length > 0 && (
          <Section>
            <Heading as="h2" style={{ ...h2, color: '#f0ad4e' }}>Due Today</Heading>
            <Text style={{ ...text, color: '#f0ad4e' }}>
              These tasks are due today:
            </Text>
            {dueTodayTasks.map((task, index) => (
              <Row key={`due-today-${index}`}>
                <Column>
                  <Text style={{ ...taskItem, color: '#f0ad4e' }}>
                    🟡 <strong>{task.task}</strong> - Due today
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {advanceTasks && advanceTasks.length > 0 && (
          <Section>
            <Heading as="h2" style={{ ...h2, color: '#5bc0de' }}>Upcoming Tasks</Heading>
            <Text style={{ ...text, color: '#5bc0de' }}>
              These tasks are coming up in the next {Math.max(...(reminderIntervals || [7]))} days:
            </Text>
            {advanceTasks.map((task, index) => {
              const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Row key={`advance-${index}`}>
                  <Column>
                    <Text style={{ ...taskItem, color: '#5bc0de' }}>
                      🔵 <strong>{task.task}</strong> - Due on {new Date(task.due_date).toLocaleDateString()} 
                      ({daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} from now)
                    </Text>
                  </Column>
                </Row>
              );
            })}
          </Section>
        )}

        <Text style={text}>Please log in to your dashboard to mark tasks as complete or adjust your maintenance schedule.</Text>
        
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
