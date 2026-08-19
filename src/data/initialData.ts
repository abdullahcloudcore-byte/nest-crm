import { Category, Post, SiteSettings, Comment } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat-arch',
    name: 'Architecture & Patterns',
    slug: 'architecture-and-patterns',
    description: 'Clean Architecture, Hexagonal, CQRS, and Domain-Driven Design tailored for enterprise NestJS applications.',
    color: '#E0234E',
    icon: 'Layers',
    metaTitle: 'NestJS Architecture & Enterprise Design Patterns | Best Practices',
    metaDescription: 'Learn how to architect large-scale NestJS apps with CQRS, Hexagonal Architecture, Modular Monoliths, and Domain-Driven Design.',
  },
  {
    id: 'cat-di',
    name: 'Dependency Injection',
    slug: 'dependency-injection',
    description: 'Mastering Inversion of Control, Custom Providers, Factory Providers, Scope Lifecycles, and Module Ref.',
    color: '#3B82F6',
    icon: 'Cpu',
    metaTitle: 'Deep Dive into NestJS Dependency Injection & Custom Providers',
    metaDescription: 'Complete guide to NestJS IoC container, dynamic modules, request scoping, circular dependencies, and custom token providers.',
  },
  {
    id: 'cat-micro',
    name: 'Microservices & Distributed',
    slug: 'microservices-distributed',
    description: 'Building event-driven microservices with Kafka, RabbitMQ, gRPC, Redis, and Hybrid NestJS applications.',
    color: '#10B981',
    icon: 'Server',
    metaTitle: 'NestJS Microservices Architecture: Kafka, gRPC & RabbitMQ',
    metaDescription: 'Build resilient distributed systems and event-driven architectures with NestJS Microservices, gRPC transport, and Hybrid apps.',
  },
  {
    id: 'cat-sec',
    name: 'Security & Authentication',
    slug: 'security-authentication',
    description: 'Guards, JWT access/refresh tokens, Passport strategies, RBAC, Rate Limiting, and CORS hardening.',
    color: '#F59E0B',
    icon: 'ShieldCheck',
    metaTitle: 'NestJS Enterprise Security: JWT, OAuth2, RBAC & Guards',
    metaDescription: 'Bulletproof your NestJS API with Passport.js, custom auth guards, role-based access control, CSRF mitigation, and helmet headers.',
  },
  {
    id: 'cat-db',
    name: 'Databases & ORM',
    slug: 'databases-orm',
    description: 'High-performance database modeling with Prisma, TypeORM, MikroORM, transactional decorators, and caching.',
    color: '#8B5CF6',
    icon: 'Database',
    metaTitle: 'NestJS with Prisma & TypeORM: Scalable Database Architecture',
    metaDescription: 'Comprehensive guide to database management in NestJS using Prisma, connection pooling, migrations, and repository patterns.',
  },
  {
    id: 'cat-devops',
    name: 'Testing & DevOps',
    slug: 'testing-devops',
    description: 'Unit testing with Jest, E2E testing with Supertest, Docker containerization, CI/CD, and Observability.',
    color: '#06B6D4',
    icon: 'Terminal',
    metaTitle: 'NestJS Testing & DevOps: Jest, E2E, Docker & Kubernetes',
    metaDescription: 'Best practices for unit testing providers, mocking modules in Jest, end-to-end testing with Test.createTestingModule, and Docker.',
  },
];

export const initialPosts: Post[] = [
  {
    id: 'post-1',
    title: 'Mastering Custom Providers & Dynamic Modules in NestJS',
    slug: 'mastering-custom-providers-dynamic-modules-nestjs',
    excerpt: 'Explore advanced Dependency Injection techniques in NestJS, including useFactory, useExisting, Async Dynamic Modules, and forRoot/forFeature patterns.',
    content: `# Mastering Custom Providers & Dynamic Modules in NestJS

NestJS has established itself as the gold standard for enterprise Node.js development, largely due to its robust **Inversion of Control (IoC)** and **Dependency Injection (DI)** container.

In this deep dive, we will explore beyond basic class providers and unlock the true modular power of NestJS.

---

## 1. Why Standard Class Providers Are Not Always Enough

Standard class-based injection via \`@Injectable()\` works seamlessly for 80% of application logic:

\`\`\`typescript
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
\`\`\`

However, enterprise applications often require:
- Injecting third-party SDK clients (e.g. AWS S3, Stripe, Redis) without instantiating them directly.
- Dynamic runtime configuration (e.g. reading from asynchronous Vault secrets).
- Switching implementations based on environment (\`useClass\` or \`useExisting\`).

---

## 2. Factory Providers with \`useFactory\`

Factory providers allow you to create dynamic objects using injected dependencies and asynchronous setup.

\`\`\`typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const client = new Redis({ host, port, retryStrategy: (times) => Math.min(times * 50, 2000) });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
\`\`\`

Injecting this custom token into any service is straightforward using the \`@Inject()\` decorator:

\`\`\`typescript
@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? JSON.parse(raw) : null;
  }
}
\`\`\`

---

## 3. Creating Configurable Dynamic Modules (\`forRootAsync\`)

When building reusable packages (e.g., mailer, payment gateways), consumers need to pass options asynchronously:

\`\`\`typescript
import { DynamicModule, Module, Provider } from '@nestjs/common';

export interface MailerModuleOptions {
  apiKey: string;
  senderEmail: string;
}

export interface MailerAsyncOptions {
  useFactory: (...args: any[]) => Promise<MailerModuleOptions> | MailerModuleOptions;
  inject?: any[];
}

export const MAILER_OPTIONS = 'MAILER_OPTIONS';

@Module({})
export class MailerModule {
  static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: MAILER_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: MailerModule,
      providers: [asyncProvider, MailerService],
      exports: [MailerService],
      global: true,
    };
  }
}
\`\`\`

Now consumers configure it cleanly in their \`AppModule\`:

\`\`\`typescript
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiKey: config.getOrThrow('SENDGRID_API_KEY'),
        senderEmail: 'noreply@company.com',
      }),
    }),
  ],
})
export class AppModule {}
\`\`\`

---

## 4. Key Architectural Takeaways

1. **Avoid Service Locators**: Always declare dependencies explicitly in constructor parameters.
2. **Prefer Symbols for Custom Tokens**: String tokens can collide across npm packages; \`Symbol('TOKEN_NAME')\` guarantees uniqueness.
3. **Module Encapsulation**: Remember to list providers in the \`exports\` array of your module if other modules need access.

*Happy Nesting!*`,
    categoryId: 'cat-di',
    tags: ['NestJS', 'Dependency Injection', 'IoC', 'TypeScript', 'Clean Code'],
    status: 'published',
    featured: true,
    author: {
      name: 'Kamil Mysliwiec',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Core Contributor & Architect',
      bio: 'Enterprise Node.js architect passionate about clean code, modular design, and high-performance server architectures.',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    publishedAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-15T14:30:00Z',
    readingTimeMinutes: 7,
    views: 3420,
    likes: 184,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Mastering Custom Providers & Dynamic Modules in NestJS | Guide',
      metaDescription: 'Learn how to build asynchronous dynamic modules, factory providers, and custom injection tokens in NestJS enterprise applications.',
      focusKeyword: 'NestJS Custom Providers',
      keywords: ['NestJS', 'Dependency Injection', 'Dynamic Modules', 'useFactory', 'Custom Providers', 'IoC Container'],
      score: 94,
    },
  },
  {
    id: 'post-2',
    title: 'Building Resilient Microservices with NestJS and Apache Kafka',
    slug: 'building-resilient-microservices-nestjs-apache-kafka',
    excerpt: 'Step-by-step architectural blueprint to implement event-driven microservices in NestJS using Kafka consumer groups, dead letter queues, and idempotent handlers.',
    content: `# Building Resilient Microservices with NestJS and Apache Kafka

Event-Driven Architecture (EDA) decouples microservices, enabling unprecedented horizontal scaling, fault tolerance, and async data processing.

In this guide, we will connect NestJS with **Apache Kafka** using the native \`@nestjs/microservices\` transport.

---

## 1. Setting up the Kafka Hybrid Application

NestJS allows a service to serve both HTTP REST traffic and listen to Kafka message streams simultaneously via hybrid configuration:

\`\`\`typescript
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Attach Kafka microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'],
        clientId: 'order-service',
      },
      consumer: {
        groupId: 'order-consumer-group',
        allowAutoTopicCreation: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log('Order Service HTTP & Kafka microservice running');
}
bootstrap();
\`\`\`

---

## 2. Emitting Events with \`ClientKafka\`

Inject the \`ClientKafka\` instance into your services to emit order lifecycle events:

\`\`\`typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  amount: number;
  createdAt: Date;
}

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('order.process');
    await this.kafkaClient.connect();
  }

  async createOrder(data: { userId: string; amount: number }) {
    const order = { id: crypto.randomUUID(), ...data, createdAt: new Date() };

    // Emit fire-and-forget event
    this.kafkaClient.emit('order.created', JSON.stringify(order));
    return order;
  }
}
\`\`\`

---

## 3. Consuming Messages with \`@EventPattern\` & \`@MessagePattern\`

In the consuming microservice (e.g., Payment or Notification service):

\`\`\`typescript
import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  @EventPattern('order.created')
  async handleOrderCreated(
    @Payload() message: OrderCreatedEvent,
    @Ctx() context: KafkaContext,
  ) {
    const originalMessage = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();

    console.log(\`Received order \${message.orderId} from topic \${topic} [partition \${partition}]\`);
    // Process notification (e.g. send customer email)
  }
}
\`\`\`

---

## 4. Handling Failures with Dead Letter Queues (DLQ)

When processing fails unexpectedly, routing the poisoned payload to a DLQ prevents consumer group lag:

\`\`\`typescript
try {
  await this.processPayment(message);
} catch (error) {
  this.kafkaClient.emit('order.payment.dlq', {
    originalPayload: message,
    errorMessage: error.message,
    timestamp: new Date(),
  });
}
\`\`\`

---

## Summary
NestJS's built-in Kafka transport abstracts serialization and connection pooling while giving you full access to Kafka partitions, headers, and consumer commits.`,
    categoryId: 'cat-micro',
    tags: ['NestJS', 'Kafka', 'Microservices', 'Event-Driven', 'Docker', 'Distributed Systems'],
    status: 'published',
    featured: true,
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'Cloud Architect & Distributed Systems Lead',
      bio: 'Specializing in high-throughput event-driven microservices, Kafka pipelines, and Kubernetes orchestrations.',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    publishedAt: '2026-08-14T11:20:00Z',
    updatedAt: '2026-08-14T11:20:00Z',
    readingTimeMinutes: 9,
    views: 2890,
    likes: 215,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Building Microservices with NestJS and Kafka | Architecture Guide',
      metaDescription: 'Step-by-step guide to building scalable, event-driven microservices using NestJS and Apache Kafka with error handling and DLQ.',
      focusKeyword: 'NestJS Kafka Microservices',
      keywords: ['NestJS', 'Kafka', 'Microservices', 'Event Pattern', 'Distributed Systems', 'TypeScript'],
      score: 96,
    },
  },
  {
    id: 'post-3',
    title: 'Enterprise Authentication in NestJS: JWT, Refresh Tokens & RBAC',
    slug: 'enterprise-authentication-nestjs-jwt-rbac',
    excerpt: 'Comprehensive guide to building production-grade auth in NestJS featuring Passport.js, Argon2 hashing, rotation refresh tokens, and granular Role-Based Access Control.',
    content: `# Enterprise Authentication in NestJS: JWT, Refresh Tokens & RBAC

Security is the cornerstone of any enterprise API. In this tutorial, we implement a battle-tested authentication and authorization pipeline using **NestJS**, **Passport.js**, **Argon2**, and **Custom Metadata Decorators**.

---

## 1. Architecture Flow

1. **User Login**: Validates credentials using Argon2 $\\rightarrow$ returns short-lived \`accessToken\` (15m) and long-lived \`refreshToken\` (7d, stored hashed in DB).
2. **Access Guard**: \`JwtAuthGuard\` verifies the bearer token on incoming requests.
3. **Roles Guard**: \`RolesGuard\` reads role metadata from \`@Roles('ADMIN')\` decorators using \`Reflector\`.
4. **Token Refreshing**: Client exchanges refresh token for a fresh key pair with token family invalidation.

---

## 2. Implementing the Roles Decorator & Guard

Define a strongly typed custom decorator using \`SetMetadata\`:

\`\`\`typescript
import { SetMetadata } from '@nestjs/common';

export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
\`\`\`

Now implement the \`RolesGuard\` utilizing NestJS's \`Reflector\`:

\`\`\`typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Public route or no role restrictions
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Access denied: Unauthenticated user');
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(\`User lacks required role: \${requiredRoles.join(', ')}\`);
    }

    return true;
  }
}
\`\`\`

---

## 3. Protecting Controllers with Clean Composition

Compose guards and decorators for clean, self-documenting endpoints:

\`\`\`typescript
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
\`\`\`

---

## 4. Refresh Token Rotation Best Practice

Always hash refresh tokens with Argon2 before persisting them to your database to prevent database-compromise replay attacks. When a token is refreshed, invalidate the old token and issue a fresh pair.

\`\`\`typescript
async refreshTokens(userId: string, rt: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.hashedRefreshToken) throw new ForbiddenException('Access Denied');

  const rtMatches = await argon2.verify(user.hashedRefreshToken, rt);
  if (!rtMatches) throw new ForbiddenException('Access Denied');

  const tokens = await this.getTokens(user.id, user.email, user.roles);
  await this.updateRtHash(user.id, tokens.refreshToken);
  return tokens;
}
\`\`\`

---

## Key Takeaways
- Use **Argon2id** over bcrypt for password and token hashing.
- Keep access tokens lightweight and short-lived.
- Leverage NestJS **Guards** and **Interceptors** for separation of auth concerns.`,
    categoryId: 'cat-sec',
    tags: ['NestJS', 'Security', 'JWT', 'RBAC', 'Passport', 'Authentication'],
    status: 'published',
    featured: false,
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'AppSec Engineer & NestJS Specialist',
      bio: 'Focused on OAuth2, cryptographic protocols, token management, and Zero Trust API architectures.',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    publishedAt: '2026-08-12T16:45:00Z',
    updatedAt: '2026-08-12T16:45:00Z',
    readingTimeMinutes: 8,
    views: 1980,
    likes: 142,
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Enterprise Authentication in NestJS: JWT, Refresh Tokens & RBAC',
      metaDescription: 'Step-by-step tutorial on securing NestJS APIs with JWT authentication, Argon2 hashing, refresh token rotation, and role guards.',
      focusKeyword: 'NestJS JWT Authentication',
      keywords: ['NestJS', 'JWT', 'RBAC', 'Authentication', 'Passport.js', 'Guards', 'Security'],
      score: 92,
    },
  },
  {
    id: 'post-4',
    title: 'High-Performance Database Layer: NestJS with Prisma 6 & Connection Pooling',
    slug: 'high-performance-database-nestjs-prisma-6',
    excerpt: 'Optimize your NestJS database layer with Prisma 6, custom repositories, Prisma client extensions, interactive transactions, and PgBouncer connection pooling.',
    content: `# High-Performance Database Layer: NestJS with Prisma 6 & Connection Pooling

Data access latency often accounts for 80% of total API response time. Integrating **Prisma ORM** with **NestJS** requires mindful lifecycle management to avoid connection exhaustion and redundant queries.

---

## 1. Creating the Singleton \`PrismaService\`

Extend \`PrismaClient\` and implement NestJS lifecycle hooks for graceful shutdown:

\`\`\`typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
\`\`\`

---

## 2. Using Prisma Client Extensions in NestJS

Prisma Client Extensions allow you to add automatic soft-deletes, audit timestamps, and computed fields cleanly without duplicating logic across services:

\`\`\`typescript
@Injectable()
export class ExtendedPrismaService {
  public readonly extendedClient = new PrismaClient().$extends({
    model: {
      user: {
        async findByEmailOrThrow(email: string) {
          const user = await this.findUnique({ where: { email } });
          if (!user) throw new NotFoundException('User not found');
          return user;
        },
      },
    },
    query: {
      $allModels: {
        async delete({ model, operation, args, query }) {
          // Soft delete interception
          return (this as any)[model].update({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
}
\`\`\`

---

## 3. Transaction Management in Business Logic

Use interactive transactions (\`$transaction\`) to ensure ACID compliance:

\`\`\`typescript
async transferFunds(sourceAccountId: string, targetAccountId: string, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    const source = await tx.account.update({
      where: { id: sourceAccountId },
      data: { balance: { decrement: amount } },
    });

    if (source.balance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    const target = await tx.account.update({
      where: { id: targetAccountId },
      data: { balance: { increment: amount } },
    });

    return { source, target };
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}
\`\`\`

---

## 4. Connection Pooling with PgBouncer
When deploying to serverless or containerized environments (Cloud Run, Kubernetes), configure direct connection parameters in your \`DATABASE_URL\`:

\`\`\`env
DATABASE_URL="postgres://user:pass@pgbouncer.internal:6432/db?pgbouncer=true&connection_limit=20"
DIRECT_URL="postgres://user:pass@db.internal:5432/db"
\`\`\`

This guarantees your NestJS pods do not saturate Postgres connection thresholds during traffic spikes.`,
    categoryId: 'cat-db',
    tags: ['NestJS', 'Prisma', 'Database', 'PostgreSQL', 'Performance', 'ORM'],
    status: 'published',
    featured: false,
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'AppSec Engineer & NestJS Specialist',
      bio: 'Focused on OAuth2, cryptographic protocols, token management, and Zero Trust API architectures.',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    publishedAt: '2026-08-10T14:10:00Z',
    updatedAt: '2026-08-10T14:10:00Z',
    readingTimeMinutes: 6,
    views: 1650,
    likes: 118,
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'NestJS with Prisma 6: Database Best Practices & Pooling Guide',
      metaDescription: 'Optimize NestJS database performance using Prisma 6, interactive transactions, lifecycle management, and connection pooling.',
      focusKeyword: 'NestJS Prisma ORM',
      keywords: ['NestJS', 'Prisma', 'PostgreSQL', 'Connection Pooling', 'Database ORM', 'TypeScript'],
      score: 91,
    },
  },
  {
    id: 'post-5',
    title: 'Clean Architecture with NestJS & Domain-Driven Design (DDD)',
    slug: 'clean-architecture-nestjs-domain-driven-design-ddd',
    excerpt: 'Structuring large-scale NestJS codebases using Domain-Driven Design principles, Aggregates, Value Objects, Use Cases, and Hexagonal Ports & Adapters.',
    content: `# Clean Architecture with NestJS & Domain-Driven Design (DDD)

When a NestJS codebase grows beyond 50 modules, standard MVC folder structures (controllers/services/entities) collapse under high coupling.

**Clean Architecture** isolates core business logic from framework concerns, making your application testable and adaptable.

---

## 1. The Onion Architecture Layers

1. **Domain Layer**: Pure TypeScript entities, Value Objects, Domain Events, and Repository interfaces. Zero dependencies on NestJS!
2. **Application Layer**: Use Cases / Command Handlers / Query Handlers (orchestrating business flow).
3. **Infrastructure Layer**: NestJS controllers, Prisma repositories, RabbitMQ publishers, external HTTP clients.

---

## 2. Directory Structure of a Domain Slice

\`\`\`
src/modules/order/
├── domain/
│   ├── order.entity.ts         # Pure domain logic
│   ├── order-status.vo.ts      # Value object
│   ├── order-created.event.ts  # Domain event
│   └── order.repository.port.ts# Abstract port interface
├── application/
│   ├── commands/
│   │   ├── create-order.command.ts
│   │   └── create-order.handler.ts
│   └── queries/
│       └── get-order.query.ts
└── infrastructure/
    ├── controllers/
    │   └── order.controller.ts
    ├── repositories/
    │   └── prisma-order.repository.ts
    └── order.module.ts
\`\`\`

---

## 3. Creating a Pure Domain Aggregate

Notice how our domain aggregate has no \`@Injectable()\` or \`@Column()\` decorators:

\`\`\`typescript
export class Order {
  private constructor(
    private readonly _id: string,
    private _customerEmail: string,
    private _totalAmount: number,
    private _status: 'PENDING' | 'PAID' | 'CANCELLED',
  ) {}

  public static create(customerEmail: string, items: { price: number; qty: number }[]): Order {
    if (items.length === 0) {
      throw new Error('An order must contain at least one item');
    }

    const total = items.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
    return new Order(crypto.randomUUID(), customerEmail, total, 'PENDING');
  }

  public pay(): void {
    if (this._status !== 'PENDING') {
      throw new Error('Only pending orders can be paid');
    }
    this._status = 'PAID';
  }

  get id() { return this._id; }
  get status() { return this._status; }
  get totalAmount() { return this._totalAmount; }
}
\`\`\`

---

## 4. Inverting Dependency in NestJS Module

Bind the abstract repository port to the infrastructure adapter via NestJS providers:

\`\`\`typescript
import { Module } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT } from './domain/order.repository.port';
import { PrismaOrderRepository } from './infrastructure/repositories/prisma-order.repository';
import { CreateOrderHandler } from './application/commands/create-order.handler';
import { OrderController } from './infrastructure/controllers/order.controller';

@Module({
  controllers: [OrderController],
  providers: [
    CreateOrderHandler,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: PrismaOrderRepository,
    },
  ],
})
export class OrderModule {}
\`\`\`

---

## Summary
By separating pure business logic from framework adapters, you can change database providers, upgrade NestJS versions, or switch to gRPC without modifying a single line of domain business logic.`,
    categoryId: 'cat-arch',
    tags: ['NestJS', 'Clean Architecture', 'DDD', 'Hexagonal Architecture', 'Enterprise', 'Design Patterns'],
    status: 'published',
    featured: false,
    author: {
      name: 'Kamil Mysliwiec',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Core Contributor & Architect',
      bio: 'Enterprise Node.js architect passionate about clean code, modular design, and high-performance server architectures.',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    publishedAt: '2026-08-08T10:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z',
    readingTimeMinutes: 10,
    views: 4120,
    likes: 310,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    seo: {
      metaTitle: 'Clean Architecture with NestJS & Domain-Driven Design (DDD)',
      metaDescription: 'Master enterprise Clean Architecture and DDD in NestJS. Implement Aggregates, Value Objects, Hexagonal Ports, and Use Cases.',
      focusKeyword: 'NestJS Clean Architecture DDD',
      keywords: ['NestJS', 'Clean Architecture', 'DDD', 'Domain Driven Design', 'Hexagonal Architecture', 'Ports and Adapters'],
      score: 97,
    },
  },
];

export const initialComments: Comment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    authorName: 'Alex Thorne',
    authorEmail: 'alex@techlead.io',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    content: 'The explanation of useFactory with dynamic Symbol tokens saved our team hours on our Redis module migration. Brilliant breakdown!',
    createdAt: '2026-08-16T08:30:00Z',
    likes: 14,
    status: 'approved',
  },
  {
    id: 'comm-2',
    postId: 'post-1',
    authorName: 'Sarah Jenkins',
    authorEmail: 'sarah.j@dev.to',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    content: 'Question: When using forRootAsync in multi-tenant environments, what is the best practice for tenant-scoped options providers?',
    createdAt: '2026-08-16T10:15:00Z',
    likes: 5,
    status: 'approved',
  },
  {
    id: 'comm-3',
    postId: 'post-2',
    authorName: 'Dmitri Pavlov',
    authorEmail: 'dmitri@microservices.cloud',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    content: 'The Dead Letter Queue pattern with NestJS Kafka contexts is pure gold. We implemented this in production with 10M events/day seamlessly.',
    createdAt: '2026-08-15T14:40:00Z',
    likes: 9,
    status: 'approved',
  },
];

export const initialSettings: SiteSettings = {
  siteName: 'NestJS Developer Hub',
  siteUrl: 'https://nestjs-blog.dev',
  tagline: 'Enterprise Node.js Architecture, Microservices & Deep Dives',
  description: 'The premier technical publication for NestJS engineers, architects, and backend developers building enterprise-grade TypeScript systems.',
  defaultOgImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
  twitterHandle: '@nestframework',
  githubUrl: 'https://github.com/nestjs/nest',
  authorName: 'NestJS Core Community',
  authorBio: 'Curated technical tutorials and architectural best practices written by NestJS architects and contributors.',
  authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  enableComments: true,
  enableAiAssistant: true,
  googleAnalyticsId: 'G-NESTJS9999',
};
