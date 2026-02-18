const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const dependentRoutes = require('./routes/dependentRoutes');
const dependentsShareRoutes = require('./routes/dependentShareRoutes');
const routineRoutes = require('./routes/routineRoutes');
const routineLogRoutes = require('./routes/routineLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middlewares/errorHandler');
const timezoneMiddleware = require('./middlewares/timezoneMiddleware');
const { startRoutineMonitor } = require('./services/routineMonitor');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(timezoneMiddleware);

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/dependents', dependentRoutes);
app.use('/dependents', dependentsShareRoutes);
app.use('/dependents', routineRoutes);
app.use('/', routineLogRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

//startRoutineMonitor();

app.get('/health', (req, res) => {
	res.json({status: 'ok'});
});

app.listen(process.env.PORT, () => {
	console.log(`Servidor rodando na porta ${process.env.PORT}`);
});

// Senha superuser Postgres Windows: D3f@ultP0stgr3s!
// Senha luccare_user Postgres Windows: D3f@ultU$er!