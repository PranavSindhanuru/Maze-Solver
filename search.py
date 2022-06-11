from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def h(p1, p2):
    x1, y1 = p1
    x2, y2 = p2
    return abs(x1 - x2) + abs(y1 - y2)


def box_adjacent(p, dx, dy):
    n = list()
    for i, j in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        x = p[0] + i
        y = p[1] + j
        if x < 0 or x > dx - 1 or y < 0 or y > dy - 1:
            continue
        n.append((x, y))
    return n


def move_cost(p, barriers):
    for b in barriers:
        if p == b:
            return 10000
    return 1


@app.get('/{start}/{end}/{dx}/{dy}/{barriers}')
def search(start, end, dx: int, dy: int, barriers):
    start = tuple(map(int, start.split(',')))
    end = tuple(map(int, end.split(',')))
    if barriers == '0':
        barriers = list()
    else:
        barriers = list(map(int, barriers.split(',')))
        barriers = [tuple(barriers[i:i+2]) for i in range(0, len(barriers), 2)]

    g_cost = dict()
    f_cost = dict()

    g_cost[start] = 0
    f_cost[start] = h(start, end)

    done = set()
    not_done = set([start])
    parent = dict()

    while len(not_done):
        now = None
        now_score = None

        for p in not_done:
            if now is None or f_cost[p] < now_score:
                now = p
                now_score = f_cost[p]

        if now == end:
            path = [now]
            while now in parent:
                now = parent[now]
                path.append(now)
                # path = path[1:len(path)-1]
            for i in barriers:
                if (i in path):
                    return "none"
            return path

        not_done.remove(now)
        done.add(now)

        for adjacent in box_adjacent(now, dx, dy):
            if adjacent in done:
                continue

            good_box = g_cost[now] + move_cost(adjacent, barriers)

            if adjacent not in not_done:
                not_done.add(adjacent)
            elif good_box >= g_cost[adjacent]:
                continue

            parent[adjacent] = now
            g_cost[adjacent] = good_box
            f_cost[adjacent] = g_cost[adjacent] + h(adjacent, end)

    return []
