import React, { useState } from 'react';
import { Code, Copy, Check, Sparkles, Layers, ShieldCheck, Terminal, Workflow, ArrowRight } from 'lucide-react';

interface CheatSection {
  id: string;
  title: string;
  badge: string;
  description: string;
  code: string;
}

const cheatsheetData: CheatSection[] = [
  {
    id: 'controller',
    title: 'Controllers & HTTP Routing',
    badge: '@Controller',
    description: 'Handles incoming HTTP requests and returns structured responses with decorators.',
    code: `import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('limit') limit = 20) {
    return this.usersService.findAll(limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}`,
  },
  {
    id: 'provider',
    title: 'Providers & Dependency Injection',
    badge: '@Injectable',
    description: 'Encapsulates business logic, data access, and asynchronous side-effects.',
    code: `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }
}`,
  },
  {
    id: 'guard',
    title: 'Guards & Authorization',
    badge: 'CanActivate',
    description: 'Determines whether a given request will be handled by the route handler.',
    code: `import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Missing bearer access token');
    }

    return true; // Validate JWT payload
  }
}`,
  },
  {
    id: 'interceptor',
    title: 'Interceptors & Response Mapping',
    badge: 'NestInterceptor',
    description: 'Binds extra logic before / after method execution, transforms result or exceptions.',
    code: `import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      map(data => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        executionTimeMs: Date.now() - now,
        data,
      }))
    );
  }
}`,
  },
  {
    id: 'pipe',
    title: 'Validation Pipes & DTO Transformation',
    badge: 'PipeTransform',
    description: 'Transforms input data to desired type and validates payload before handler runs.',
    code: `import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) return value;
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}`,
  },
];

export const NestCheatsheet: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('controller');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSnippet = cheatsheetData.find((s) => s.id === selectedSection) || cheatsheetData[0];

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 pb-8 space-y-3">
        <div className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold text-[#C45E3D] dark:text-[#E07353]">
          Reference Blueprint
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-light text-[#1A1A1A] dark:text-[#F5F3ED] tracking-tight">
          NestJS Architecture Manual
        </h1>
        <p className="text-base sm:text-lg text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 font-sans max-w-3xl leading-relaxed">
          Production-grade TypeScript templates for the fundamental primitives of NestJS applications.
        </p>
      </div>

      {/* Main Layout: Navigation Sidebar + Code Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-widest text-[#7E7C76] font-bold border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 mb-2">
            Architecture Primitives
          </div>
          {cheatsheetData.map((item) => {
            const isSelected = selectedSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedSection(item.id)}
                className={`w-full text-left p-3.5 transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A] border-[#1A1A1A]'
                    : 'border-transparent text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:bg-[#F9F8F4] dark:hover:bg-[#242420]'
                }`}
              >
                <div>
                  <div className="font-serif text-sm font-medium">{item.title}</div>
                  <div className="font-mono text-[11px] opacity-70 mt-0.5">{item.badge}</div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>

        {/* Code Showcase Panel */}
        <div className="lg:col-span-8 border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 bg-[#121210] text-[#F5F3ED] overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-[#1A1A1A] border-b border-[#2A2A26] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#E07353] font-bold">
                <span>{activeSnippet.badge}</span>
                <span>•</span>
                <span>TypeScript 5.x</span>
              </div>
              <h3 className="font-serif text-2xl text-[#F5F3ED] mt-1">
                {activeSnippet.title}
              </h3>
              <p className="text-xs text-[#B5B3AC] mt-1 font-sans">
                {activeSnippet.description}
              </p>
            </div>

            <button
              onClick={() => handleCopy(activeSnippet.code, activeSnippet.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#F5F3ED] text-xs font-mono uppercase font-bold tracking-wider transition-colors self-start sm:self-auto border border-[#3A3A34]"
            >
              {copiedId === activeSnippet.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <pre className="p-6 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed bg-[#121210]">
            <code>{activeSnippet.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
