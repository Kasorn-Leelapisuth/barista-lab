import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';

  try {
    if (type === 'admin') {
      const items = await prisma.menuItem.findMany({ orderBy: { createdAt: 'desc' } });
      const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
      const applications = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ items, orders, applications });
    }

    const items = await prisma.menuItem.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Customer creates an order
    if (action === 'CREATE_ORDER') {
      const { customerName, phone, pickupTime, total, items } = body;
      const orderNumber = `BL-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerName,
          phone,
          pickupTime,
          total,
          itemsJson: JSON.stringify(items),
          status: 'PENDING',
        },
      });

      return NextResponse.json(order);
    }

    // 2. Candidate applies for a job
    if (action === 'APPLY_JOB') {
      const { roleTitle, name, email, phone, availability, experience } = body;
      const app = await prisma.application.create({
        data: {
          roleTitle,
          name,
          email,
          phone,
          availability,
          experience,
        },
      });
      return NextResponse.json(app);
    }

    // 3. Admin creates a new menu item
    if (action === 'CREATE_MENU_ITEM') {
      const { pass, name, category, price, description, image, isCoffeeSweet } = body;
      if (pass !== 'barista123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const newItem = await prisma.menuItem.create({
        data: {
          name,
          category: category || 'Coffee Sweets',
          price: parseFloat(price) || 0,
          description: description || '',
          image: image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          isCoffeeSweet: Boolean(isCoffeeSweet),
          isAvailable: true,
        },
      });
      return NextResponse.json(newItem);
    }

    // 4. Admin edits menu item & uploads photo
    if (action === 'UPDATE_MENU_ITEM') {
      const { pass, id, name, category, price, description, image, isCoffeeSweet, isAvailable } = body;
      if (pass !== 'barista123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const updated = await prisma.menuItem.update({
        where: { id },
        data: {
          name,
          category,
          price: parseFloat(price) || 0,
          description,
          image,
          isCoffeeSweet: Boolean(isCoffeeSweet),
          isAvailable,
        },
      });
      return NextResponse.json(updated);
    }

    // 5. Admin deletes a menu item
    if (action === 'DELETE_MENU_ITEM') {
      const { pass, id } = body;
      if (pass !== 'barista123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      await prisma.menuItem.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    // 6. Admin updates order status
    if (action === 'UPDATE_ORDER_STATUS') {
      const { pass, id, status } = body;
      if (pass !== 'barista123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}